import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { toast } from "react-toastify";
import { useChangeJobApplicantStatus } from "../../../hooks/useJobs";
import { ClipboardList } from "lucide-react";

const STATUS_OPTIONS = [
    "Submitted",
    "Under Review",
    "Shortlisted",
    "Interviewed",
    "Offered",
    "Rejected",
];

function JobApplicantStatusMutate({ applicant, closeModal }) {
    const { mutate: changeStatus, isPending } = useChangeJobApplicantStatus();

    const [payload, setPayload] = useState({
        status: applicant?.status || "Submitted",
        notes: applicant?.adminNotes || "",
    });

    const set = (k) => (e) => setPayload((p) => ({ ...p, [k]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        changeStatus(
            {
                id: applicant._id,
                status: payload.status,
                notes: payload.notes,
            },
            {
                onSuccess: () => {
                    toast.success("Application status updated successfully.");
                    closeModal();
                },
                onError: (err) => {
                    toast.error(err?.message || "Failed to update status.");
                },
            }
        );
    };

    return (
        <CustomModal
            isOpen
            title="Update Application Status"
            subtitle={`Applicant: ${applicant?.fullName ?? "—"}`}
            icon={<ClipboardList size={16} />}
            size="default"
            onClose={closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal} disabled={isPending}>
                        Cancel
                    </button>
                    <button type="submit" form="status-form" className="modal-submit" disabled={isPending}>
                        {isPending ? <Spinner /> : "Save Status"}
                    </button>
                </>
            }
        >
            <form id="status-form" className="form-grid" onSubmit={handleSubmit}>

                {/* Current status info */}
                <div className="form-group col-1" style={{ marginBottom: 4 }}>
                    <div style={{
                        padding: "10px 14px",
                        background: "rgba(59,130,246,0.06)",
                        border: "1px solid rgba(59,130,246,0.15)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#475569",
                    }}>
                        <span style={{ fontWeight: 600 }}>Current status: </span>
                        <span style={{ color: "#3b82f6", fontWeight: 700 }}>{applicant?.status}</span>
                    </div>
                </div>

                {/* New status */}
                <div className="form-group col-1">
                    <label className="modal-label">
                        New Status <span className="req">*</span>
                    </label>
                    <select
                        className="modal-input"
                        value={payload.status}
                        onChange={set("status")}
                        required
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <div className="form-group col-1">
                    <label className="modal-label">Admin Notes</label>
                    <textarea
                        className="modal-input"
                        rows={4}
                        placeholder="Add notes about this status decision…"
                        value={payload.notes}
                        onChange={set("notes")}
                        style={{ resize: "vertical", minHeight: 100 }}
                    />
                </div>

            </form>
        </CustomModal>
    );
}

export default JobApplicantStatusMutate;
