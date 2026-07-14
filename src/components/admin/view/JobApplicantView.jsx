import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useJobApplicantById } from "../../../hooks/useJobs";
import {
    User, Mail, Phone, Briefcase, Award, FileText,
    Calendar, Users, ExternalLink, AlertCircle,
    GraduationCap, Layers, ShieldCheck, Download,
    CheckCircle2, Clock, XCircle,
} from "lucide-react";
import "./LecturerView.css";
import "./JobApplicantView.css";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";
import { jsPDF } from "jspdf";

/* ── Resolve server doc URL ── */
const resolveDocUrl = (filePath) => {
    if (!filePath) return null;
    return filePath.replace(/^.*[/\\]uploads[/\\]/, `https://career.uisto.edu.ng/uploads/`);
};

/* ── Generate PDF from reference text ── */
const downloadRefAsPdf = (ref, applicantName) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reference Letter", margin, 60);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Applicant: ${applicantName ?? "—"}`, margin, 82);
    doc.text(`Referee: ${ref.name ?? "—"}`, margin, 98);
    doc.text(`Email: ${ref.email ?? "—"}`, margin, 114);
    if (ref.submittedAt) {
        doc.text(`Submitted: ${formatDate(ref.submittedAt)}`, margin, 130);
    }

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, 142, pageWidth - margin, 142);

    // Body text
    doc.setTextColor(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(ref.referenceText ?? "", usableWidth);
    doc.text(lines, margin, 162);

    const fileName = `Reference_${(ref.name ?? "referee").replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
};

function JobApplicantView({ id, closeModal }) {
    const { data: response, isLoading, isError, error } = useJobApplicantById(id);
    const ap = response?.data;
    const [exporting, setExporting] = useState(false);

    const aiStatus = ap?.aiScore?.shortlistStatus || "Pending";
    const appStatus = ap?.status || "Submitted";

    const aiColorClass = {
        "Auto-Shortlisted": "green",
        "Rejected": "red",
        "Manual Review": "orange",
        "Pending": "gray",
    }[aiStatus] ?? "gray";

    const docs = ap?.documents ?? {};
    const docLinks = [
        { label: "Resume", url: resolveDocUrl(docs.resume) },
        { label: "Cover Letter", url: resolveDocUrl(docs.coverLetter) },
        { label: "Supporting Document", url: resolveDocUrl(docs.supportingDocument) },
    ].filter((d) => d.url);

    const handleExportCsv = () => {
        if (!ap || exporting) return;
        setExporting(true);
        try {
            exportApplicantToCsv(ap);
        } finally {
            setExporting(false);
        }
    };

    return (
        <CustomModal
            isOpen
            title="Applicant Details"
            subtitle={isLoading ? "Loading…" : (ap?.fullName ?? "—")}
            size="wide"
            onClose={closeModal}
            footer={
                <div style={{ display: "flex", gap: 10 }}>
                    {ap && (
                        <button
                            type="button"
                            className="modal-submit"
                            onClick={handleExportCsv}
                            disabled={exporting}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                            <Download size={14} />
                            {exporting ? "Exporting…" : "Export CSV"}
                        </button>
                    )}
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                        Close
                    </button>
                </div>
            }
        >
            {/* Loading */}
            {isLoading && (
                <div className="lv-loader">
                    <div className="spinner" />
                    <p>Loading applicant details…</p>
                </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
                <div className="lv-loader">
                    <span style={{ fontSize: 32 }}>⚠️</span>
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>Failed to load applicant.</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>{error?.message}</p>
                </div>
            )}

            {/* Content */}
            {!isLoading && !isError && ap && (
                <div className="lv-wrapper">

                    {/* ── Hero ── */}
                    <div className="lv-hero">
                        <div className="av-icon">
                            <User size={26} strokeWidth={1.6} />
                        </div>
                        <div className="lv-hero-info">
                            <h3 className="lv-name">{ap.fullName}</h3>
                            <span className="lv-email"><Mail size={13} /> {ap.personalInfo?.email}</span>
                            <span className="lv-email"><Phone size={13} /> {ap.personalInfo?.phone}</span>
                            <div className="lv-status-row" style={{ marginTop: 6 }}>
                                <StatusBadge status={appStatus} />
                                <span className={`av-ai-pill ${aiColorClass}`}>
                                    AI: {aiStatus}
                                </span>
                            </div>
                        </div>
                        {ap.applicationId && (
                            <div className="av-app-id">
                                <span className="av-app-id-label">Application ID</span>
                                <span className="av-app-id-value">{ap.applicationId}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Job Applied For ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Briefcase size={14} /> Job Applied For</div>
                        <div className="lv-rows">
                            <LvRow label="Position" value={ap.job?.position?.title ?? ap.jobId?.position?.title} />
                            <LvRow label="Cadre" value={ap.job?.position?.cadre ?? ap.jobId?.position?.cadre} />
                            <LvRow label="Type" value={ap.job?.description ?? ap.jobId?.description} />
                            <LvRow label="Deadline" value={formatDate(ap.job?.applicationDeadline ?? ap.jobId?.applicationDeadline)} />
                            <LvRow label="Published" value={formatDate(ap.job?.publishedDate ?? ap.jobId?.publishedDate)} />
                        </div>
                        {/* Job requirements */}
                        {(() => {
                            const reqs = ap.job?.position?.requirements ?? ap.jobId?.position?.requirements ?? [];
                            if (!reqs.length) return null;
                            return (
                                <div style={{ marginTop: 10 }}>
                                    <p className="av-missing-label" style={{ color: "#64748b" }}>Job Requirements</p>
                                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                                        {reqs.map((r, i) => (
                                            <li key={i} style={{ fontSize: 13, color: "#475569" }}>
                                                {typeof r === "string" ? r : r.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })()}
                    </div>

                    {/* ── Personal Information ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><User size={14} /> Personal Information</div>
                        <div className="lv-rows">
                            <LvRow label="Full Name" value={ap.fullName} />
                            <LvRow label="Date of Birth" value={formatDate(ap.personalInfo?.dateOfBirth)} />
                            <LvRow label="Gender" value={ap.personalInfo?.gender ? capitalize(ap.personalInfo.gender) : undefined} />
                            <LvRow label="Marital Status" value={ap.personalInfo?.maritalStatus ? capitalize(ap.personalInfo.maritalStatus) : undefined} />
                            <LvRow label="Email" value={ap.personalInfo?.email} />
                            <LvRow label="Phone" value={ap.personalInfo?.phone} />
                        </div>
                    </div>

                    {/* ── Application Info ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Calendar size={14} /> Application Info</div>
                        <div className="lv-rows">
                            <LvRow label="Application ID" value={ap.applicationId} />
                            <LvRow label="Applied At" value={formatDate(ap.appliedAt)} />
                            <LvRow label="Last Updated" value={formatDate(ap.updatedAt)} />
                            <LvRow label="Viewed At" value={ap.viewedAt ? formatDate(ap.viewedAt) : "Not yet viewed"} />
                            <LvRow label="Status" value={<StatusBadge status={appStatus} />} />
                            {ap.adminNotes && <LvRow label="Admin Notes" value={ap.adminNotes} />}
                        </div>
                    </div>

                    {/* ── Qualifications ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><GraduationCap size={14} /> Qualifications</div>
                        <div className="lv-rows">
                            <LvRow label="Has PhD" value={ap.qualifications?.hasPhd ? "Yes" : "No"} />
                            <LvRow label="NYSC Completed" value={ap.qualifications?.nysc?.completed ? "Yes" : "No"} />
                        </div>
                        {ap.qualifications?.degrees?.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <p className="av-missing-label" style={{ color: "#64748b" }}>Degrees</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {ap.qualifications.degrees.map((deg, i) => (
                                        <div key={i} className="av-degree-card">
                                            <span className="av-degree-type">{capitalize(deg.degreeType)}</span>
                                            <span className="av-degree-inst">{deg.institution}</span>
                                            {deg.programme && (
                                                <span className="av-degree-year" style={{ color: "#64748b" }}>
                                                    {deg.programme.replace(/_/g, " ")}
                                                </span>
                                            )}
                                            {(deg.yearAwarded || deg.year) && (
                                                <span className="av-degree-year">{deg.yearAwarded ?? deg.year}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Experience ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Layers size={14} /> Experience</div>
                        <div className="lv-rows">
                            <LvRow label="Industry Years" value={ap.experience?.industryYears ?? 0} />
                            <LvRow label="Teaching Years" value={ap.experience?.teachingYears ?? 0} />
                            <LvRow label="Research Years" value={ap.experience?.researchYears ?? 0} />
                            <LvRow label="Publications" value={ap.experience?.publications ?? 0} />
                            {ap.experience?.postQualificationExperience > 0 && (
                                <LvRow label="Post-Qualification Exp." value={`${ap.experience.postQualificationExperience} years`} />
                            )}
                        </div>
                    </div>

                    {/* ── Professional Info ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><ShieldCheck size={14} /> Professional Info</div>
                        <div className="lv-rows">
                            <LvRow label="ICT Proficient" value={ap.professionalInfo?.ictProficiency ? "Yes" : "No"} />
                        </div>

                        {ap.professionalInfo?.computerSkills?.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <p className="av-missing-label" style={{ color: "#64748b" }}>Computer Skills</p>
                                <div className="av-tag-list">
                                    {ap.professionalInfo.computerSkills.map((s, i) => (
                                        <span key={i} className="av-tag">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ap.professionalInfo?.certifications?.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <p className="av-missing-label" style={{ color: "#64748b" }}>Certifications</p>
                                <div className="av-tag-list">
                                    {ap.professionalInfo.certifications.map((c, i) => (
                                        <span key={i} className="av-tag">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── AI Assessment ── */}
                    {ap.aiScore && (
                        <div className="lv-card">
                            <div className="lv-card-head"><Award size={14} /> AI Assessment</div>
                            <div className="lv-rows">
                                <LvRow label="AI Status" value={ap.aiScore.shortlistStatus} />
                                {ap.aiScore.overallScore != null && <LvRow label="Overall Score" value={`${ap.aiScore.overallScore} / 100`} />}
                                {ap.aiScore.qualificationScore != null && <LvRow label="Qualification" value={`${ap.aiScore.qualificationScore} / 100`} />}
                                {ap.aiScore.experienceScore != null && <LvRow label="Experience" value={`${ap.aiScore.experienceScore} / 100`} />}
                                {ap.aiScore.publicationScore != null && <LvRow label="Publication" value={`${ap.aiScore.publicationScore} / 100`} />}
                                {ap.aiScore.professionalScore != null && <LvRow label="Professional" value={`${ap.aiScore.professionalScore} / 100`} />}
                                {(ap.aiScore.recommendation ?? ap.aiScore.aiRecommendation) && (
                                    <LvRow label="Recommendation" value={ap.aiScore.recommendation ?? ap.aiScore.aiRecommendation} />
                                )}
                            </div>

                            {ap.aiScore.missingRequirements?.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <p className="av-missing-label">Missing Requirements</p>
                                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                                        {ap.aiScore.missingRequirements.map((r, i) => (
                                            <li key={i} className="av-missing-item">
                                                <AlertCircle size={12} /> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Documents ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><FileText size={14} /> Documents</div>
                        {docLinks.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {docLinks.map(({ label, url }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="av-doc-link"
                                    >
                                        <FileText size={14} /> {label} <ExternalLink size={12} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="lv-no-subjects">No documents uploaded.</p>
                        )}
                    </div>

                    {/* ── Referees ── */}
                    {ap.referees?.length > 0 && (
                        <div className="lv-card">
                            <div className="lv-card-head"><Users size={14} /> Referees</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {ap.referees.map((ref, idx) => (
                                    <div key={idx} className="av-referee-card">
                                        {/* Referee header row */}
                                        <div className="av-referee-header">
                                            <div className="av-referee-name">{ref.name}</div>
                                            <RefereeStatusBadge submitted={ref.hasSubmitted} />
                                        </div>

                                        <div className="lv-rows">
                                            <LvRow label="Email" value={ref.email} />
                                            {ref.title && <LvRow label="Title" value={ref.title} />}
                                            {ref.institution && <LvRow label="Institution" value={ref.institution} />}
                                            {ref.phone && <LvRow label="Phone" value={ref.phone} />}
                                            {ref.submittedAt && (
                                                <LvRow label="Submitted On" value={formatDate(ref.submittedAt)} />
                                            )}
                                        </div>

                                        {/* Reference text or download */}
                                        {ref.hasSubmitted && ref.referenceText && (
                                            <div className="av-ref-text-box">
                                                <div className="av-ref-text-label">Reference Statement</div>
                                                <button
                                                    className="av-ref-download-btn"
                                                    onClick={() => downloadRefAsPdf(ref, ap.fullName)}
                                                    title="Download as PDF"
                                                >
                                                    <Download size={13} /> Download as PDF
                                                </button>
                                            </div>
                                        )}

                                        {/* PDF file if referee uploaded one */}
                                        {ref.hasSubmitted && (ref.referenceFile || ref.referenceDocument) && (
                                            <a
                                                href={resolveDocUrl(ref.referenceFile ?? ref.referenceDocument)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="av-doc-link"
                                                style={{ marginTop: 10 }}
                                            >
                                                <Download size={14} /> Download Reference File <ExternalLink size={12} />
                                            </a>
                                        )}

                                        {!ref.hasSubmitted && (
                                            <p className="av-ref-pending">
                                                <Clock size={12} /> Awaiting referee response…
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* No data */}
            {!isLoading && !isError && !ap && (
                <div className="lv-loader">
                    <span style={{ fontSize: 28 }}>🔍</span>
                    <p>Applicant not found.</p>
                </div>
            )}
        </CustomModal>
    );
}

/* ── Helper: capitalize first letter ── */
function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── Single-record CSV export ── */
function exportApplicantToCsv(ap) {
    const pi = ap.personalInfo ?? {};
    const ai = ap.aiScore ?? {};
    const exp = ap.experience ?? {};
    const pro = ap.professionalInfo ?? {};
    const job = ap.job?.position ?? ap.jobId?.position ?? {};

    const degrees = (ap.qualifications?.degrees ?? [])
        .map((d) => [
            capitalize(d.degreeType),
            d.institution,
            d.programme ? d.programme.replace(/_/g, " ") : "",
            d.yearAwarded ?? d.year ?? "",
        ].filter(Boolean).join(" | "))
        .join("; ");

    const referees = (ap.referees ?? [])
        .map((r) => `${r.name} <${r.email}> [${r.hasSubmitted ? "Submitted" : "Pending"}]`)
        .join("; ");

    const headers = [
        // Identity
        "Application ID", "Full Name", "First Name", "Middle Name", "Last Name",
        "Email", "Phone", "Gender", "Date of Birth", "Marital Status", "NIN",
        // Job
        "Position", "Cadre", "Job Type", "Deadline", "Published",
        // Status
        "Application Status", "AI Shortlist Status",
        // AI Scores
        "Overall Score", "Qualification Score", "Experience Score",
        "Publication Score", "Professional Score",
        "AI Recommendation", "Missing Requirements",
        // Experience
        "Teaching Years", "Research Years", "Industry Years",
        "Publications", "Post-Qual. Experience (yrs)",
        // Qualifications
        "Has PhD", "NYSC Completed", "Degrees",
        // Professional
        "ICT Proficient", "COREN Registered", "Computer Skills", "Certifications",
        // Referees & dates
        "Referees", "Applied At", "Last Updated",
    ];

    const row = [
        ap.applicationId ?? "",
        ap.fullName ?? "",
        pi.firstName ?? "",
        pi.middleName ?? "",
        pi.lastName ?? "",
        pi.email ?? "",
        pi.phone ?? "",
        capitalize(pi.gender) ?? "",
        pi.dateOfBirth ? formatDate(pi.dateOfBirth) : "",
        capitalize(pi.maritalStatus) ?? "",
        pi.nin ?? "",
        job.title ?? "",
        job.cadre ?? "",
        ap.job?.description ?? ap.jobId?.description ?? "",
        (ap.job?.applicationDeadline ?? ap.jobId?.applicationDeadline) ? formatDate(ap.job?.applicationDeadline ?? ap.jobId?.applicationDeadline) : "",
        (ap.job?.publishedDate ?? ap.jobId?.publishedDate) ? formatDate(ap.job?.publishedDate ?? ap.jobId?.publishedDate) : "",
        ap.status ?? "",
        ai.shortlistStatus ?? "Pending",
        ai.overallScore ?? "",
        ai.qualificationScore ?? "",
        ai.experienceScore ?? "",
        ai.publicationScore ?? "",
        ai.professionalScore ?? "",
        ai.recommendation ?? ai.aiRecommendation ?? "",
        (ai.missingRequirements ?? []).join(" | "),
        exp.teachingYears ?? 0,
        exp.researchYears ?? 0,
        exp.industryYears ?? 0,
        exp.publications ?? 0,
        exp.postQualificationExperience ?? 0,
        ap.qualifications?.hasPhd ? "Yes" : "No",
        ap.qualifications?.nysc?.completed ? "Yes" : "No",
        degrees,
        pro.ictProficiency ? "Yes" : "No",
        pro.hasCOREN ? "Yes" : "No",
        (pro.computerSkills ?? []).join("; "),
        (pro.certifications ?? []).join("; "),
        referees,
        ap.appliedAt ? formatDate(ap.appliedAt) : "",
        ap.updatedAt ? formatDate(ap.updatedAt) : "",
    ];

    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
        headers.map(escape).join(","),
        row.map(escape).join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicant_${(ap.applicationId ?? "record").replace(/[^a-z0-9]/gi, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

/* ── Referee submission badge ── */
function RefereeStatusBadge({ submitted }) {
    return submitted ? (
        <span className="av-ref-badge submitted">
            <CheckCircle2 size={11} /> Submitted
        </span>
    ) : (
        <span className="av-ref-badge pending">
            <XCircle size={11} /> Pending
        </span>
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

export default JobApplicantView;