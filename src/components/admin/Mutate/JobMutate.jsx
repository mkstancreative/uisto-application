import React, { useEffect, useRef, useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { toast } from "react-toastify";
import { useCreateJob, useJobById, useUpdateJob, usePositions, useRequirements } from "../../../hooks/useJobs";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";

function JobMutate({ data = {}, closeModal }) {
    const isEdit = Boolean(data?._id || data?.id);
    const idToUpdate = data?._id || data?.id;

    const { data: jobsById } = useJobById(idToUpdate);

    const { data: posRes } = usePositions({ limit: 1000 });
    const positions = posRes?.data || [];

    const { data: reqRes } = useRequirements({ limit: 1000 });
    const requirementsData = reqRes?.data || [];
    const requirementsOptions = requirementsData.map(r => ({ id: r._id || r.id, name: r.name }));

    /* ── form state ── always start blank; the useEffect below seeds on edit ── */
    const [form, setForm] = useState({
        position: "",
        description: "",
        applicationDeadline: "",
        extraRequirements: [],
    });

    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

        /* ── Populate form once when both the fetched job AND positions are ready ── */
    const populated = useRef(false);

    useEffect(() => {
        if (!isEdit) return;
        if (populated.current) return;       // already seeded — don't overwrite user edits
        if (!jobsById?.data) return;          // job not fetched yet
        if (!positions.length) return;        // positions not loaded yet

        populated.current = true;

        const job = jobsById.data;

        let posValue = "";
        if (job.position && typeof job.position === "object") {
            if (job.position._id) posValue = String(job.position._id);
            else if (job.position.id) posValue = String(job.position.id);
            else if (job.position.title) {
                // Fallback: match by title if the populated object lacks an ID
                const match = positions.find(p => p.title === job.position.title);
                if (match) posValue = String(match._id || match.id || "");
            }
        } else {
            posValue = String(job.position || "");
        }

        const extractReqId = (r) => {
            if (typeof r === "string") return r;
            if (r?._id || r?.id) return String(r._id || r.id);
            if (r?.requirement) return String(r.requirement?._id || r.requirement?.id || r.requirement);
            return "";
        };

        setForm({
            position: posValue,
            description: job.description ?? "",
            applicationDeadline: job.applicationDeadline
                ? job.applicationDeadline.slice(0, 10)
                : "",
            extraRequirements: Array.isArray(job.extraRequirements)
                ? job.extraRequirements.map(extractReqId).filter(Boolean)
                : [],
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, jobsById?.data?._id, positions.length]); // stable primitives — avoids stale object refs

    /* ── mutations ── */
    const { mutate: create, isPending: creating } = useCreateJob();
    const { mutate: update, isPending: updating } = useUpdateJob();
    const isPending = creating || updating;

    const onSubmit = (e) => {
        e.preventDefault();

        const payload = {
            position: form.position,
            description: form.description,
            extraRequirements: form.extraRequirements,
        };

        if (form.applicationDeadline) {
            payload.applicationDeadline = new Date(form.applicationDeadline).toISOString();
        }

        if (isEdit) payload.id = idToUpdate;

        const mutate = isEdit ? update : create;
        mutate(payload, {
            onSuccess: () => {
                toast.success(isEdit ? "Job updated successfully" : "Job created successfully");
                closeModal();
            },
            onError: (err) => toast.error(err?.message ?? "Operation failed"),
        });
    };

    // Derived logic for displaying base position requirements
    const selectedPosition = positions.find(p => String(p._id || p.id) === String(form.position));
    const baseRequirementsIds = selectedPosition?.requirements || [];
    const baseRequirementsNames = baseRequirementsIds.map(req => {
        const reqId = typeof req === 'object' ? (req._id || req.id) : req;
        const match = requirementsData.find(r => String(r._id || r.id) === String(reqId));
        return match ? match.name : "Unknown Requirement";
    });

    return (
        <CustomModal
            isOpen
            title={isEdit ? "Edit Job Posting" : "Add New Job"}
            subtitle="Fill in the details for this job vacancy."
            size="wide"
            onClose={closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                        Cancel
                    </button>
                    <button type="submit" form="job-form" className="modal-submit" disabled={isPending || !form.position || !form.description}>
                        {isPending ? <Spinner /> : isEdit ? "Save Changes" : "Publish Job"}
                    </button>
                </>
            }
        >
            <form id="job-form" className="form-grid" onSubmit={onSubmit}>

                {/* ── Basic Info ── */}
                <div className="form-group col-2">
                    <label className="modal-label">Position <span className="req">*</span></label>
                    <select
                        className="modal-input"
                        value={form.position}
                        onChange={set("position")}
                        required
                    >
                        <option value="">— Select Position —</option>
                        {positions.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group col-2">
                    <label className="modal-label">Application Deadline</label>
                    <input
                        type="date"
                        className="modal-input"
                        value={form.applicationDeadline}
                        onChange={set("applicationDeadline")}
                    />
                </div>

                {selectedPosition && baseRequirementsNames.length > 0 && (
                    <div className="form-group col-12" style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
                        <label className="modal-label" style={{ marginBottom: "5px" }}>Base Position Requirements</label>
                        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#555" }}>
                            {baseRequirementsNames.map((name, idx) => (
                                <li key={idx}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="form-group col-12">
                    <label className="modal-label">Description <span className="req">*</span></label>
                    <textarea
                        className="modal-input"
                        rows={4}
                        placeholder="Describe the role and responsibilities…"
                        value={form.description}
                        onChange={set("description")}
                        required
                        style={{ resize: "vertical", minHeight: 100 }}
                    />
                </div>

                {/* ── Requirements ── */}
                <div className="form-group col-12">
                    <label className="modal-label">Extra Requirements</label>
                    <MultiSelectPicker
                        options={requirementsOptions}
                        value={form.extraRequirements}
                        onChange={(val) => setForm(prev => ({ ...prev, extraRequirements: val }))}
                        placeholder="Select any additional requirements..."
                    />
                </div>
            </form>
        </CustomModal>
    );
}

export default JobMutate;