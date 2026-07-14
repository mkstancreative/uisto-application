import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useJobById } from "../../../hooks/useJobs";
import { Briefcase, Calendar, CheckCircle2, Award, BookOpen } from "lucide-react";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";

function JobView({ id, closeModal }) {
    const { data: response, isLoading, isError, error } = useJobById(id);
    const job = response?.data ?? {};

    return (
        <CustomModal
            isOpen
            title="Job Details"
            subtitle={isLoading ? "Loading…" : (job.position?.title ?? "—")}
            size="wide"
            onClose={closeModal}
            footer={
                <button type="button" className="modal-cancel" onClick={closeModal}>
                    Close
                </button>
            }
        >
            {/* Loading */}
            {isLoading && (
                <div className="lv-loader">
                    <div className="spinner" />
                    <p>Loading job details…</p>
                </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
                <div className="lv-loader">
                    <span style={{ fontSize: 32 }}>⚠️</span>
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>Failed to load job.</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>{error?.message}</p>
                </div>
            )}

            {/* Content */}
            {!isLoading && !isError && job._id && (
                <div className="lv-wrapper">

                    {/* ── Hero ── */}
                    <div className="lv-hero">
                        <div style={{
                            width: 56, height: 56, borderRadius: 12,
                            background: "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(234,88,12,0.12))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#d4600a", flexShrink: 0,
                        }}>
                            <Briefcase size={26} strokeWidth={1.6} />
                        </div>
                        <div className="lv-hero-info">
                            <h3 className="lv-name">{job.position?.title ?? "—"}</h3>
                            <span className="lv-email">
                                <Award size={13} /> Cadre: {job.position?.cadre ?? "—"}
                            </span>
                            {job.position?.faculty && (
                                <span className="lv-email">
                                    <BookOpen size={13} /> Faculty: {job.position.faculty}
                                </span>
                            )}
                            {job.position?.department && (
                                <span className="lv-email">
                                    <BookOpen size={13} /> Department: {job.position.department}
                                </span>
                            )}
                            <div className="lv-status-row" style={{ marginTop: 4 }}>
                                <StatusBadge status={job.isActive ? "Active" : "Inactive"} />
                                <StatusBadge status={job.isOpen ? "Open" : "Closed"} />
                            </div>
                        </div>
                    </div>

                    {/* ── Overview ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Briefcase size={14} /> Overview</div>
                        <div className="lv-rows">
                            <LvRow label="Published" value={formatDate(job.publishedDate)} />
                            <LvRow
                                label="Deadline"
                                value={
                                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <Calendar size={12} />
                                        {formatDate(job.applicationDeadline)}
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><BookOpen size={14} /> Description</div>
                        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0 }}>
                            {job.description ?? "—"}
                        </p>
                    </div>

                    {/* ── Position Base Requirements ── */}
                    {job.position?.requirements?.length > 0 && (
                        <div className="lv-card">
                            <div className="lv-card-head"><CheckCircle2 size={14} /> Position Requirements</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {job.position.requirements.map((r, i) => (
                                    <span key={i} className="lv-chip">{r}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Extra Requirements ── */}
                    {job.extraRequirements?.length > 0 && (
                        <div className="lv-card">
                            <div className="lv-card-head"><CheckCircle2 size={14} /> Extra Requirements</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {job.extraRequirements.map((r, i) => (
                                    <span key={i} className="lv-chip">{r}</span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* No data */}
            {!isLoading && !isError && !job._id && (
                <div className="lv-loader">
                    <span style={{ fontSize: 28 }}>🔍</span>
                    <p>No data found for this job.</p>
                </div>
            )}
        </CustomModal>
    );
}

function LvRow({ label, value }) {
    return (
        <div className="lv-row">
            <span className="lv-row-label">{label}</span>
            <span className="lv-row-value">{value ?? "—"}</span>
        </div>
    );
}

export default JobView;
