import { useState } from "react";
import { toast } from "react-toastify";
import { ClipboardList, Lock } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useAuth } from "../../../hooks/useAuth";
import { APPLICATION_STATUSES, useUpdateApplicationStatus } from "../../../hooks/useApplications";
import { canWrite } from "../../../utils/roles";
import { errorMessage } from "../../../api/api";

/**
 * Change an application's pipeline status (registrar / hrm only).
 * `applicant` needs at least { _id, fullName, status } — adminNotes pre-fills the notes box.
 */
function JobApplicantStatusMutate({ applicant, closeModal, onSaved }) {
    const { user } = useAuth();
    const allowed = canWrite(user);
    const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

    const current = applicant?.status || "Submitted";
    const [status, setStatus] = useState(current);
    const [notes, setNotes] = useState(applicant?.adminNotes ?? "");

    const unchanged = status === current && notes.trim() === (applicant?.adminNotes ?? "").trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!allowed || !applicant?._id || unchanged) return;

        updateStatus(
            { id: applicant._id, status, notes: notes.trim() || undefined },
            {
                onSuccess: (res) => {
                    toast.success(res?.message || `Status updated to '${status}'.`);
                    onSaved?.(status);
                    closeModal?.();
                },
                onError: (err) => toast.error(errorMessage(err, "Could not update the status.")),
            }
        );
    };

    if (!allowed) {
        return (
            <CustomModal
                isOpen
                title="Update Application Status"
                icon={<Lock size={16} />}
                onClose={closeModal}
                footer={
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                        Close
                    </button>
                }
            >
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
                    Your role is read-only. Only a Registrar or HR Manager can change an application's status.
                </p>
            </CustomModal>
        );
    }

    return (
        <CustomModal
            isOpen
            title="Update Application Status"
            subtitle={`${applicant?.fullName ?? "Applicant"}${applicant?.applicationId ? ` · ${applicant.applicationId}` : ""}`}
            icon={<ClipboardList size={16} />}
            onClose={isPending ? undefined : closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal} disabled={isPending}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="application-status-form"
                        className="modal-submit"
                        disabled={isPending || unchanged}
                    >
                        {isPending ? <Spinner size={16} color="currentColor" text="Saving" /> : "Save status"}
                    </button>
                </>
            }
        >
            <form id="application-status-form" className="form-grid" onSubmit={handleSubmit}>
                <div className="form-group col-12" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span className="modal-label" style={{ margin: 0 }}>Current status</span>
                    <StatusBadge status={current} />
                </div>

                <div className="form-group col-12">
                    <label className="modal-label" htmlFor="application-status">
                        New status <span className="req">*</span>
                    </label>
                    <select
                        id="application-status"
                        className="modal-input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-12">
                    <label className="modal-label" htmlFor="application-notes">
                        Notes <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional — saved as admin notes)</span>
                    </label>
                    <textarea
                        id="application-notes"
                        className="modal-input"
                        rows={4}
                        maxLength={2000}
                        placeholder="Why is the status changing?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ resize: "vertical", minHeight: 100 }}
                    />
                </div>
            </form>
        </CustomModal>
    );
}

export default JobApplicantStatusMutate;
