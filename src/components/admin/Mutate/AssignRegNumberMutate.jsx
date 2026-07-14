import React, { useState } from "react";
import { toast } from "react-toastify";
import CustomModal from "@/components/ui/CustomModal/CustomModal";
import Spinner from "@/components/ui/Spinner/Spinner";
import { useAssignRegNumber } from "../../../hooks/useStudents";
import { useDepartments } from "../../../hooks/useDepartments";

function AssignRegNumberMutate({ student, closeModal }) {
  /* ── Pre-fill from the passed student ── */
  const [form, setForm] = useState({
    student_id: student?.id ? String(student.id) : "",
    dept_id: student?.department?.id ? String(student.department.id) : "",
  });

  /* ── Data ── */
  const { data: deptRes, isLoading: deptsLoading } = useDepartments();
  const departments = deptRes?.data ?? [];

  const { mutate: assignReg, isPending } = useAssignRegNumber();

  /* ── Helpers ── */
  const studentLabel = student
    ? `${student.fname ?? ""} ${student.lname ?? ""}${student.regno ? ` (${student.regno})` : ""}`
    : "—";

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Submit ── */
  const onSubmit = (e) => {
    e.preventDefault();

    if (!form.student_id) {
      toast.error("Student is missing.");
      return;
    }
    if (!form.dept_id) {
      toast.error("Please select a department.");
      return;
    }

    assignReg(
      {
        student_id: form.student_id,
        dept_id: Number(form.dept_id),
      },
      {
        onSuccess: (res) => {
          if (res?.success === false) {
            toast.error(
              res?.message ?? "Failed to assign registration number.",
            );
            return;
          }
          toast.success(
            res?.message ?? "Registration number assigned successfully.",
          );
          closeModal?.();
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ??
              err?.message ??
              "An error occurred.",
          );
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen
      onClose={closeModal}
      title="Assign Registration Number"
      subtitle={`Assigning reg. number for: ${studentLabel}`}
      size="default"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={closeModal}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assign-reg-form"
            className="modal-submit"
            disabled={isPending || deptsLoading}
          >
            {isPending ? <Spinner /> : "Assign"}
          </button>
        </>
      }
    >
      <form id="assign-reg-form" onSubmit={onSubmit} className="form-grid">
        {/* ── Student (read-only display) ── */}
        <div className="form-group col-2">
          <label className="modal-label">Student</label>
          <input
            className="modal-input"
            value={studentLabel}
            readOnly
            disabled
            style={{ opacity: 0.75, cursor: "not-allowed" }}
          />
        </div>

        {/* ── Department ── */}
        <div className="form-group col-2">
          <label className="modal-label">Department *</label>
          <select
            className="modal-input"
            value={form.dept_id}
            onChange={set("dept_id")}
            required
            disabled={deptsLoading}
          >
            <option value="">
              {deptsLoading ? "Loading departments…" : "Select department"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── Info note ── */}
        <div className="col-2" style={{ marginTop: 4 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted, #888)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            A unique registration number will be automatically generated and
            assigned to this student based on the selected department.
          </p>
        </div>
      </form>
    </CustomModal>
  );
}

export default AssignRegNumberMutate;
