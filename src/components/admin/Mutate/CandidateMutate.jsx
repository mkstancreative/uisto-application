import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { toast } from "react-toastify";
import { useCreateCandidate, useElectionPositions } from "../../../hooks/usePolls";
import { useStudents } from "../../../hooks/useStudents";
import { useSessions } from "../../../hooks/useSessions";

function CandidateMutate({ closeModal }) {
    const [form, setForm] = useState({
        student_id: "",
        position_id: "",
        session_id: "",
    });

    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    /* Reference data */
    const { data: studentsRes } = useStudents();
    const { data: positionsRes } = useElectionPositions();
    const { data: sessionsRes } = useSessions();

    const students = studentsRes?.data ?? [];
    const positions = positionsRes?.data ?? [];
    const sessions = sessionsRes?.data ?? [];

    const { mutate: create, isPending } = useCreateCandidate();

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.student_id || !form.position_id || !form.session_id) {
            toast.warning("Please fill in all required fields.");
            return;
        }
        create(form, {
            onSuccess: (res) => { toast.success(res?.message ?? "Candidate added."); closeModal(); },
            onError: (err) => toast.error(err?.message ?? "Failed to add candidate."),
        });
    };

    return (
        <CustomModal
            isOpen
            title="Add Candidate"
            subtitle="Assign a student to an election position."
            size="default"
            onClose={closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button
                        type="submit"
                        form="candidate-form"
                        className="modal-submit"
                        disabled={isPending || !form.student_id || !form.position_id || !form.session_id}
                    >
                        {isPending ? <Spinner /> : "Add Candidate"}
                    </button>
                </>
            }
        >
            <form id="candidate-form" className="form-grid" onSubmit={onSubmit}>
                {/* Student */}
                <div className="form-group col-1">
                    <label className="modal-label">Student *</label>
                    <select className="modal-input" value={form.student_id} onChange={set("student_id")}>
                        <option value="">— Select Student —</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.fname} {s.lname} {s.regno ? `(${s.regno})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Position */}
                <div className="form-group col-2">
                    <label className="modal-label">Election Position *</label>
                    <select className="modal-input" value={form.position_id} onChange={set("position_id")}>
                        <option value="">— Select Position —</option>
                        {positions.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Session */}
                <div className="form-group col-2">
                    <label className="modal-label">Session *</label>
                    <select className="modal-input" value={form.session_id} onChange={set("session_id")}>
                        <option value="">— Select Session —</option>
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </form>
        </CustomModal>
    );
}

export default CandidateMutate;
