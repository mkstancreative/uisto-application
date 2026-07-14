import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useLecturerById } from "../../../hooks/useAdmin";
import { User, Phone, BookOpen, GraduationCap, Mail, Building } from "lucide-react";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";
import "./LecturerView.css";
import { BASE_URL } from "../../../api/api";


function LecturerView({ id, closeModal }) {
    const { data: response, isLoading, isError, error } = useLecturerById(id);


    const raw = response?.data;
    const lec = Array.isArray(raw) ? (raw[0] ?? {}) : (raw ?? {});
    const user = lec.user ?? {};

    const fullName = [lec.firstname, lec.middlename, lec.lastname]
        .filter(Boolean).join(" ") || "—";

    const passportSrc = lec.passport
        ? `${BASE_URL}/uploads/${lec.passport}`
        : null;

    return (
        <CustomModal
            isOpen
            title="Lecturer Profile"
            subtitle={isLoading ? "Loading…" : fullName}
            size="wide"
            onClose={closeModal}
            footer={
                <button type="button" className="modal-cancel" onClick={closeModal}>
                    Close
                </button>
            }
        >
            {/* ── Loading ── */}
            {isLoading && (
                <div className="lv-loader">
                    <div className="spinner" />
                    <p>Loading profile…</p>
                </div>
            )}

            {/* ── Error ── */}
            {isError && !isLoading && (
                <div className="lv-loader">
                    <span style={{ fontSize: 32 }}>⚠️</span>
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>
                        Failed to load profile.
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                        {error?.message}
                    </p>
                </div>
            )}

            {/* ── Content ── */}
            {!isLoading && !isError && lec.id && (
                <div className="lv-wrapper">
                    {/* ── Hero ── */}
                    <div className="lv-hero">
                        <div className="lv-avatar">
                            {passportSrc ? (
                                <img
                                    src={passportSrc}
                                    alt={fullName}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.nextSibling.style.display = "flex";
                                    }}
                                />
                            ) : null}
                            <div
                                className="lv-avatar-fallback"
                                style={{ display: passportSrc ? "none" : "flex" }}
                            >
                                <User size={40} strokeWidth={1.4} />
                            </div>
                        </div>
                        <div className="lv-hero-info">
                            <h3 className="lv-name">{fullName}</h3>
                            <span className="lv-email">
                                <Mail size={13} /> {user.username ?? "—"}
                            </span>
                            <span className="lv-email" style={{ marginTop: -2 }}>
                                <Phone size={13} /> {lec.phone ?? "—"}
                            </span>
                            <div className="lv-status-row">
                                <StatusBadge status={user.userstatus?.trim() || "Unknown"} />
                                <span className="lv-gender-pill">{lec.gender ?? "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Info grid ── */}
                    <div className="lv-grid">

                        <div className="lv-card">
                            <div className="lv-card-head">
                                <Building size={14} /> Academic
                            </div>
                            <div className="lv-rows">
                                <LvRow label="Department" value={lec.department?.name} />
                                <LvRow label="Qualification" value={lec.qualification} />
                                <LvRow label="Profile / Role" value={lec.profile} />
                                <LvRow label="Profile / Role" value={lec.onlinelink} />
                                <LvRow label="Date Joined" value={formatDate(lec.date_created)} />
                            </div>
                        </div>

                        <div className="lv-card">
                            <div className="lv-card-head">
                                <Phone size={14} /> Location
                            </div>
                            <div className="lv-rows">
                                <LvRow label="State" value={lec.state?.name} />
                                <LvRow label="Country" value={lec.country?.name} />
                                <LvRow label="Address" value={lec.address} />
                            </div>
                        </div>

                    </div>

                    {/* ── Subjects ── */}
                    <div className="lv-subjects-section">
                        <div className="lv-card-head" style={{ marginBottom: 10 }}>
                            <BookOpen size={14} /> Assigned Subjects
                        </div>
                        {lec.subjects?.length > 0 ? (
                            <div className="lv-subject-chips">
                                {lec.subjects.map((s) => (
                                    <span key={s.id} className="lv-chip">
                                        <GraduationCap size={11} />
                                        {s.name ?? s.title}
                                        {s.subjectcode ? (
                                            <span style={{ opacity: 0.65, fontWeight: 400 }}>
                                                &nbsp;({s.subjectcode})
                                            </span>
                                        ) : null}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="lv-no-subjects">No subjects assigned yet.</p>
                        )}
                    </div>

                </div>
            )}

            {/* ── Empty / no data ── */}
            {!isLoading && !isError && !lec.id && (
                <div className="lv-loader">
                    <span style={{ fontSize: 28 }}>🔍</span>
                    <p>No data found for this lecturer.</p>
                </div>
            )}
        </CustomModal>
    );
}

function LvRow({ label, value }) {
    return (
        <div className="lv-row">
            <span className="lv-row-label">{label}</span>
            <span className="lv-row-value">{value || "—"}</span>
        </div>
    );
}

export default LecturerView;