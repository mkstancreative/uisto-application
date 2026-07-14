import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useSessions } from "../../../hooks/useSessions";
import { useSemesters } from "../../../hooks/useSemesters";
import { useDepartments } from "../../../hooks/useDepartments";
import { useLevels } from "../../../hooks/useLevels";
import { useCourses } from "../../../hooks/useCourses";
import { toast } from "react-toastify";
import {
  useCreateTimeTable,
  useUpdateTimeTable,
  useLectureHalls,
} from "../../../hooks/useTimeTable";
import { useProgramme } from "../../../hooks/useProgrammes";

function TimeTableMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const toTimeInput = (val) => (val ? val.slice(0, 5) : "");

  const cleanLink = (val) => {
    if (!val) return "";
    const match = val.match(/\[.*?\]\((.*?)\)/);
    return match ? match[1] : val;
  };

  const [form, setForm] = useState({
    session_id: data?.session_id || "",
    semester_id: data?.semester_id || "",
    department_id: data?.department_id || "",
    level_id: data?.level_id || "",
    programetype_id: data?.programetype_id || "",
    day_of_week: data?.day_of_week || "",
    start_time: toTimeInput(data?.start_time),
    end_time: toTimeInput(data?.end_time),
    // lecturehall_id: data?.lecturehall_id || "",
    subject_id: data?.subject_id || "",
    onlinelink: cleanLink(data?.onlinelink),
  });

  const { data: sessionRes } = useSessions({ limit: 100 });
  const { data: semesterRes } = useSemesters({ limit: 100 });
  const { data: deptRes } = useDepartments({ limit: 1000 });
  const { data: levelRes } = useLevels({ limit: 100 });
  const { data: progRes } = useProgramme({ limit: 100 });
  const { data: courseRes } = useCourses({ limit: 1000 });
  const { data: lhRes } = useLectureHalls();

  const sessions = sessionRes?.data || [];
  const semesters = semesterRes?.data || [];
  const departments = deptRes?.data || [];
  const levels = levelRes?.data || [];
  const programmes = progRes?.data || [];
  const courses = courseRes?.data || [];
  const lecture_halls = lhRes?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const { mutate: createCall, isPending: creating } = useCreateTimeTable();
  const { mutate: updateCall, isPending: updating } = useUpdateTimeTable();
  const isPending = creating || updating;

  /* ── Error parser — logs CakePHP field-level validation errors ── */
  const formatErrors = (err) => {
    const errorData = err?.response?.data || err?.data;

    if (errorData?.success === false && errorData?.data) {
      // CakePHP validation: { data: { field: { rule: "message" } } }
      const fieldErrors = errorData.data;
      Object.entries(fieldErrors).forEach(([field, errors]) => {
        if (typeof errors === "object") {
          Object.entries(errors).forEach(([rule, message]) => {
            console.error(`[TT Validation] ${field} → ${rule}: ${message}`);
            toast.error(String(message));
          });
        } else {
          console.error(`[TT Validation] ${field}: ${errors}`);
          toast.error(String(errors));
        }
      });
    } else {
      const msg = errorData?.message || err?.message || "An error occurred";
      console.error("[TT Error]", err);
      toast.error(msg);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Strip empty optional fields so we don't send empty strings
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ""),
    );

    if (isEdit) {
      updateCall(
        { ...payload, id: data.id },
        {
          onSuccess: () => {
            toast.success("Timetable updated successfully");
            closeModal();
          },
          onError: formatErrors,
        },
      );
    } else {
      createCall(payload, {
        onSuccess: () => {
          toast.success("Timetable created successfully");
          closeModal();
        },
        onError: formatErrors,
      });
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? "Edit Time Table Entry" : "Add Time Table Entry"}
      onClose={closeModal}
      size="wide"
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
            form="tt-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : isEdit ? "Save Changes" : "Create"}
          </button>
        </>
      }
    >
      <form id="tt-form" onSubmit={onSubmit} className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">
            Session <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="session_id"
            value={form.session_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Session —
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Semester <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="semester_id"
            value={form.semester_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Semester —
            </option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Programme Type <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="programetype_id"
            value={form.programetype_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Programme Type —
            </option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Department <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Department —
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Level <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="level_id"
            value={form.level_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Level —
            </option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Subject <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Subject —
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {/* <div className="form-group col-2">
                    <label className="modal-label">Lecture Hall <span className="req">*</span></label>
                    <select className="modal-input" name="lecturehall_id" value={form.lecturehall_id} onChange={handleChange}>
                        <option value="" disabled hidden>— Select Hall —</option>
                        {lecture_halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div> */}
        <div className="form-group col-2">
          <label className="modal-label">
            Day of Week <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="day_of_week"
            value={form.day_of_week}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>
              — Select Day —
            </option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Start Time <span className="req">*</span>
          </label>
          <input
            type="time"
            step="1"
            className="modal-input"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            End Time <span className="req">*</span>
          </label>
          <input
            type="time"
            step="1"
            className="modal-input"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Online Link <span className="req">*</span>
          </label>
          <input
            type="text"
            className="modal-input"
            name="onlinelink"
            placeholder="meet.google.com"
            value={form.onlinelink}
            onChange={handleChange}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default TimeTableMutate;
