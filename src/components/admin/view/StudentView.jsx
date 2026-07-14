import React from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import {
    User, Mail, Phone, GraduationCap,
    Building2, BookOpen, Hash,
    Users,
} from "lucide-react";
import { BASE_URL } from "../../../api/api";
import "./StudentView.css";
import { formatDate } from "../../../utils/helpers";

function InfoRow({ label, value }) {
    return (
        <div className="student-view-info-row">
            <span className="student-view-info-label">{label}</span>
            <span className="student-view-info-value">{value ?? "—"}</span>
        </div>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <div className="student-view-section-title">
            {icon} {children}
        </div>
    );
}

function StudentView({ data, closeModal }) {
    if (!data) return null;

    const fullName = `${data.fname ?? ""} ${data.mname ?? ""} ${data.lname ?? ""}`.replace(/\s+/g, " ").trim();
    const initials = `${data.fname?.[0] ?? ""}${data.lname?.[0] ?? ""}`.toUpperCase();
    const passportSrc = data.passporturl ? `${BASE_URL}/img/${data.passporturl}` : null;

    return (
        <CustomModal
            isOpen
            title="Student Profile"
            subtitle={`${data.regno ?? "No Reg. No."} — ${data.department?.name ?? ""}`}
            size="wide"
            onClose={closeModal}
            footer={<button className="modal-cancel" onClick={closeModal}>Close</button>}
        >
            <div className="student-view">
                {/* ── Hero ── */}
                <div className="student-view-hero">
                    {passportSrc ? (
                        <img
                            src={passportSrc}
                            alt={fullName}
                            className="student-view-avatar"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    ) : (
                        <div className="student-view-avatar">{initials}</div>
                    )}
                    <div className="student-view-hero-info">
                        <h3 className="student-view-hero-name">{fullName}</h3>
                        <div className="student-view-hero-meta">
                            {data.regno && <span><Hash size={11} /> {data.regno}</span>}
                            {data.email && <span><Mail size={11} /> {data.email}</span>}
                            {data.phone && <span><Phone size={11} /> {data.phone}</span>}
                        </div>
                    </div>
                    <StatusBadge status={data.status ?? data.studentstatus ?? "—"} />
                </div>

                {/* ── Two-column body ── */}
                <div className="student-view-grid">
                    {/* Left: personal & academic info */}
                    <div>
                        <SectionTitle icon={<User size={12} />}>Personal Information</SectionTitle>
                        <InfoRow label="Full Name" value={fullName} />
                        <InfoRow label="Gender" value={data.gender} />
                        <InfoRow label="Date of Birth" value={data.dob} />
                        <InfoRow label="Address" value={data.address} />
                        <InfoRow label="State" value={data.state?.name} />
                        <InfoRow label="Phone" value={data.phone} />
                        <InfoRow label="Email" value={data.email} />
                        <InfoRow label="Father's Name" value={data.fathersname || "—"} />
                        <InfoRow label="Mother's Name" value={data.mothersname || "—"} />
                        <InfoRow label="Father's Phone" value={data.fatherphone || "—"} />
                        <InfoRow label="Mother's Phone" value={data.motherphone || "—"} />

                        {/* Academic */}
                        <div style={{ marginTop: 20 }}>
                            <SectionTitle icon={<GraduationCap size={12} />}>Academic Information</SectionTitle>
                            <InfoRow label="Reg. Number" value={data.regno} />
                            <InfoRow label="Department" value={data.department?.name} />
                            <InfoRow label="Programme" value={data.programme?.name} />
                            <InfoRow label="Level" value={data.level?.name} />
                            <InfoRow label="Mode" value={data.mode?.name} />
                            <InfoRow label="JAMB Score" value={data.jamb} />
                            <InfoRow label="JAMB Reg No." value={data.jambregno} />
                            <InfoRow label="Admission Date" value={formatDate(data.admissiondate)} />
                            <InfoRow label="Join Date" value={formatDate(data.joindate)} />
                        </div>
                    </div>

                    {/* Right: department / status / extra info */}
                    <div>
                        <SectionTitle icon={<Building2 size={12} />}>Department & Status</SectionTitle>

                        {/* Status chips */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                            <StatusBadge status={data.status ?? "—"} />
                            {data.mode?.name && (
                                <span className="student-view-chip">
                                    <BookOpen size={11} /> {data.mode.name}
                                </span>
                            )}
                            {data.level?.name && (
                                <span className="student-view-chip">
                                    <GraduationCap size={11} /> {data.level.name}
                                </span>
                            )}
                            {data.isclaretian === "Yes" && (
                                <span className="student-view-chip">Claretian</span>
                            )}
                        </div>

                        <InfoRow label="Department" value={data.department?.name} />
                        <InfoRow label="Dept. Code" value={data.department?.deptcode} />
                        <InfoRow label="Programme" value={data.programme?.name} />
                        <InfoRow label="Level" value={data.level?.name} />
                        <InfoRow label="Gender" value={data.gender} />
                        <InfoRow label="Status" value={data.status} />
                        <InfoRow label="Student Status" value={data.studentstatus || "—"} />
                        <InfoRow label="Previous School" value={data.previousschool || "—"} />
                        <InfoRow label="University Mail" value={data.universitymail || "—"} />
                        <InfoRow label="Community" value={data.community || "—"} />

                        {/* User account info */}
                        {data.user && (
                            <div style={{ marginTop: 20 }}>
                                <SectionTitle icon={<Users size={12} />}>Account</SectionTitle>
                                <InfoRow label="Username" value={data.user.username} />
                                <InfoRow label="User Status" value={data.user.userstatus?.trim() || "—"} />
                                <InfoRow label="Created" value={formatDate(data.user.created_date)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomModal>
    );
}

export default StudentView;