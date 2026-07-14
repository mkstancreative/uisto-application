import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { BookOpen, Layers, Building2, GraduationCap, Calendar, Users } from "lucide-react";
import { formatDate } from "../../../utils/helpers";
import { BASE_URL } from "../../../api/api";
import "./CourseView.css";

function InfoRow({ label, value }) {
    return (
        <div className="course-view-info-row">
            <span className="course-view-info-label">{label}</span>
            <span className="course-view-info-value">{value ?? "—"}</span>
        </div>
    );
}

function CourseView({ data, closeModal }) {
    if (!data) return null;

    const teachers = data.teachers ?? [];
    /* department can be array or object depending on API response */
    const departments = Array.isArray(data.departments)
        ? data.departments
        : data.departments ? [data.departments] : [];

    const level = data.level ?? null;
    const semester = data.semester ?? null;

    return (
        <CustomModal
            isOpen
            title="Course Details"
            subtitle={`${data.subjectcode ?? ""} — ${data.name ?? ""}`}
            size="wide"
            onClose={closeModal}
            footer={<button className="modal-cancel" onClick={closeModal}>Close</button>}
        >
            <div className="course-view">
                {/* ── Hero strip ── */}
                <div className="course-view-hero">
                    <div className="course-view-hero-icon">
                        <BookOpen size={24} color="#fff" />
                    </div>
                    <div className="course-view-hero-info">
                        <h3 className="course-view-hero-name">{data.name}</h3>
                        <p className="course-view-hero-meta">
                            Code: <strong>{data.subjectcode ?? "—"}</strong>
                            &nbsp;·&nbsp;
                            Semester: <strong>{semester?.name ?? data.semester_id ?? "—"}</strong>
                            &nbsp;·&nbsp;
                            Level: <strong>{level?.name ?? data.level_id ?? "—"}</strong>
                        </p>
                    </div>
                    <div className="course-view-hero-right">
                        <div className="course-view-credit">
                            {data.creditload ?? "—"} <span>credit unit{data.creditload !== 1 ? "s" : ""}</span>
                        </div>
                        <StatusBadge status={data.status === 1 || data.status === "1" ? "Active" : "Inactive"} />
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="course-view-grid">
                    {/* Left: course info */}
                    <div>
                        <div className="course-view-section-title">
                            <BookOpen size={12} /> Course Information
                        </div>
                        <InfoRow label="Course Name" value={data.name} />
                        <InfoRow label="Course Code" value={data.subjectcode} />
                        <InfoRow label="Credit Units" value={data.creditload} />
                        <InfoRow label="Date Created" value={data.created_date ? formatDate(data.created_date) : "—"} />

                        {/* Level & Semester chips */}
                        <div style={{ marginTop: 18 }}>
                            <div className="course-view-section-title">
                                <Layers size={12} /> Level &amp; Semester
                            </div>
                            <div className="course-view-chips">
                                {level && (
                                    <span className="course-view-chip">
                                        <GraduationCap size={11} />
                                        {level.name}
                                    </span>
                                )}
                                {semester && (
                                    <span className="course-view-chip">
                                        <Calendar size={11} />
                                        {semester.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Departments */}
                        {departments.length > 0 && (
                            <div style={{ marginTop: 18 }}>
                                <div className="course-view-section-title">
                                    <Building2 size={12} /> Department(s)
                                </div>
                                <div className="course-view-chips">
                                    {departments.map((d) => (
                                        <span key={d.id} className="course-view-chip dept">
                                            <Building2 size={11} />
                                            {d.name?.trim()} <span style={{ opacity: 0.6, fontWeight: 400 }}>({d.deptcode})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: assigned lecturers */}
                    <div>
                        <div className="course-view-section-title">
                            <Users size={12} /> Assigned Lecturers ({teachers.length})
                        </div>
                        {teachers.length === 0 ? (
                            <p className="course-view-empty">No lecturers assigned yet.</p>
                        ) : (
                            <div className="course-view-lecturers">
                                {teachers.map((t) => {
                                    const fullName = `${t.firstname ?? ""} ${t.lastname ?? ""}`.trim() || `Lecturer ${t.id}`;
                                    const initials = `${t.firstname?.[0] ?? ""}${t.lastname?.[0] ?? ""}`.toUpperCase() || "?";
                                    const avatarSrc = t.passport ? `${BASE_URL}/img/${t.passport}` : null;

                                    return (
                                        <div key={t.id} className="course-view-lecturer-card">
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt={fullName}
                                                    style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                                    onError={(e) => { e.target.style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="course-view-lecturer-avatar">{initials}</div>
                                            )}
                                            <div>
                                                <div className="course-view-lecturer-name">{fullName}</div>
                                                <div className="course-view-lecturer-meta">
                                                    {t.qualification ? `${t.qualification.toUpperCase()} · ` : ""}
                                                    {t.profile ?? "Lecturer"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomModal>
    );
}

export default CourseView;