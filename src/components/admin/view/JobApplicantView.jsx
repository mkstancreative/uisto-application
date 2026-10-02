import { useState } from "react";
import {
    User, Mail, Phone, Briefcase, Award, FileText, Calendar, Users, ExternalLink,
    AlertCircle, GraduationCap, Layers, ShieldCheck, Download, CheckCircle2, Clock,
    ClipboardEdit, ChevronDown, ChevronUp, StickyNote, MailCheck, BellRing, AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import JobApplicantStatusMutate from "../Mutate/JobApplicantStatusMutate";
import { useApplication } from "../../../hooks/useApplications";
import { useAuth } from "../../../hooks/useAuth";
import { canWrite, getInitials } from "../../../utils/roles";
import { formatDate, formatOnlyDate } from "../../../utils/helpers";
import { downloadCsv, fileSafe } from "../../../utils/csv";
import { fileUrl } from "../../../api/session";
import { errorMessage } from "../../../api/api";
import { degreeLabel, flattenApplicationDetail } from "./applicationCsv";
import "./LecturerView.css";
import "./JobApplicantView.css";

const REFEREE_COUNT = 3;

const capitalize = (str) => (str ? String(str).charAt(0).toUpperCase() + String(str).slice(1) : str);

/* ── Reference statement → PDF (wraps across pages) ── */
const downloadRefAsPdf = async (ref, ap) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Reference Statement", margin, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90);
    const meta = [
        `Applicant: ${ap?.fullName ?? "—"}${ap?.applicationId ? ` (${ap.applicationId})` : ""}`,
        ap?.job?.position?.title ? `Vacancy: ${ap.job.position.title}` : null,
        `Referee: ${ref.name ?? "—"}`,
        `Email: ${ref.email ?? "—"}`,
        ref.submittedAt ? `Submitted: ${formatDate(ref.submittedAt)}` : null,
    ].filter(Boolean);
    let y = 84;
    meta.forEach((line) => {
        doc.text(line, margin, y);
        y += 16;
    });

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;

    doc.setTextColor(30);
    doc.setFontSize(12);
    const lineHeight = 17;
    doc.splitTextToSize(ref.referenceText ?? "", usableWidth).forEach((line) => {
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
    });

    doc.save(`Reference_${fileSafe(ref.name ?? "referee")}_${fileSafe(ap?.applicationId ?? "")}.pdf`);
};

function LvRow({ label, value }) {
    const empty = value === null || value === undefined || value === "";
    return (
        <div className="lv-row">
            <span className="lv-row-label">{label}</span>
            <span className="lv-row-value">{empty ? "—" : value}</span>
        </div>
    );
}

function ScoreBar({ label, value }) {
    const has = value !== null && value !== undefined;
    const pct = has ? Math.max(0, Math.min(100, Number(value) || 0)) : 0;
    return (
        <div className="av-score-row">
            <div className="av-score-top">
                <span>{label}</span>
                <strong>{has ? `${value}/100` : "—"}</strong>
            </div>
            <div className="av-score-track" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function RefereeCard({ referee, ap }) {
    const [open, setOpen] = useState(false);
    const file = fileUrl(referee.referenceFile);
    return (
        <div className="av-referee-card">
            <div className="av-referee-header">
                <div style={{ minWidth: 0 }}>
                    <div className="av-referee-name">{referee.name || "Unnamed referee"}</div>
                    {referee.email && (
                        <a className="av-referee-email" href={`mailto:${referee.email}`}>
                            {referee.email}
                        </a>
                    )}
                </div>
                {referee.hasSubmitted ? (
                    <span className="av-ref-badge submitted">
                        <CheckCircle2 size={11} /> Submitted
                    </span>
                ) : (
                    <span className="av-ref-badge pending">
                        <Clock size={11} /> Pending
                    </span>
                )}
            </div>

            <div className="av-ref-meta">
                {referee.submittedAt && (
                    <span>
                        <Calendar size={11} /> Submitted {formatDate(referee.submittedAt)}
                    </span>
                )}
                <span>
                    <BellRing size={11} /> {referee.reminderSent ? "Reminder sent" : "No reminder sent"}
                </span>
            </div>

            {referee.referenceText && (
                <div className="av-ref-text-box">
                    <button
                        type="button"
                        className="av-ref-toggle"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                    >
                        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {open ? "Hide reference statement" : "Read reference statement"}
                    </button>
                    {open && <p className="av-ref-text">{referee.referenceText}</p>}
                    <button
                        type="button"
                        className="av-ref-download-btn"
                        onClick={() =>
                            downloadRefAsPdf(referee, ap).catch(() =>
                                toast.error("Could not create the PDF. Please try again.")
                            )
                        }
                    >
                        <Download size={13} /> Download as PDF
                    </button>
                </div>
            )}

            {file && (
                <a href={file} target="_blank" rel="noreferrer" className="av-doc-link" style={{ marginTop: 10 }}>
                    <FileText size={14} /> Reference file <ExternalLink size={12} />
                </a>
            )}

            {!referee.hasSubmitted && (
                <p className="av-ref-pending">
                    <Clock size={12} /> Awaiting the referee's response.
                </p>
            )}
        </div>
    );
}

function JobApplicantView({ id, closeModal }) {
    const { user } = useAuth();
    const writer = canWrite(user);
    const { data: response, isLoading, isError, error, refetch } = useApplication(id);
    const ap = response?.data;
    const [editing, setEditing] = useState(false);

    if (editing && ap && writer) {
        return (
            <JobApplicantStatusMutate
                applicant={ap}
                closeModal={() => setEditing(false)}
            />
        );
    }

    const pi = ap?.personalInfo ?? {};
    const ai = ap?.aiScore ?? {};
    const exp = ap?.experience ?? {};
    const pro = ap?.professionalInfo ?? {};
    const job = ap?.job ?? {};
    const pos = job.position ?? {};
    const degrees = ap?.qualifications?.degrees ?? [];
    const referees = ap?.referees ?? [];
    const submittedRefs = ap?.ReactedReferees ?? referees.filter((r) => r.hasSubmitted).length;
    const recommendation = ai.recommendation ?? ai.aiRecommendation;
    const scored = ai.overallScore !== null && ai.overallScore !== undefined;
    const requirements = (pos.requirements ?? []).map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean);

    const docs = ap?.documents ?? {};
    const docLinks = [
        { label: "Cover letter", url: fileUrl(docs.coverLetter) },
        { label: "Résumé / CV", url: fileUrl(docs.resume) },
        { label: "Supporting document", url: fileUrl(docs.supportingDocument) },
    ].filter((d) => d.url);

    const handleExportCsv = () => {
        if (!ap) return;
        downloadCsv([flattenApplicationDetail(ap)], `application_${fileSafe(ap.applicationId ?? ap._id)}`);
    };

    return (
        <CustomModal
            isOpen
            title="Application Details"
            subtitle={isLoading ? "Loading…" : ap?.applicationId ?? ap?.fullName ?? ""}
            icon={<User size={16} />}
            size="wide"
            onClose={closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                        Close
                    </button>
                    {ap && (
                        <button
                            type="button"
                            className="modal-cancel av-footer-btn"
                            onClick={handleExportCsv}
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    )}
                    {ap && writer && (
                        <button
                            type="button"
                            className="modal-submit av-footer-btn"
                            onClick={() => setEditing(true)}
                        >
                            <ClipboardEdit size={14} /> Update status
                        </button>
                    )}
                </>
            }
        >
            {isLoading && (
                <div className="lv-loader">
                    <div className="spinner" />
                    <p>Loading application…</p>
                </div>
            )}

            {isError && !isLoading && (
                <div className="lv-loader">
                    <AlertTriangle size={28} color="#ef4444" />
                    <p style={{ fontWeight: 600 }}>{errorMessage(error, "Could not load this application.")}</p>
                    <button type="button" className="modal-cancel" onClick={() => refetch()}>
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && !isError && !ap && (
                <div className="lv-loader">
                    <p>Application not found.</p>
                </div>
            )}

            {!isLoading && !isError && ap && (
                <div className="lv-wrapper">
                    {/* ── Hero ── */}
                    <div className="lv-hero av-hero">
                        <div className="av-icon">{getInitials(ap.fullName)}</div>
                        <div className="lv-hero-info">
                            <h3 className="lv-name">{ap.fullName || "—"}</h3>
                            {(ap.email || pi.email) && (
                                <span className="lv-email"><Mail size={13} /> {ap.email || pi.email}</span>
                            )}
                            {(ap.phone || pi.phone) && (
                                <span className="lv-email"><Phone size={13} /> {ap.phone || pi.phone}</span>
                            )}
                            <div className="lv-status-row av-badges">
                                <StatusBadge status={ap.status || "Submitted"} />
                                <StatusBadge
                                    status={ai.shortlistStatus || "Pending"}
                                    label={`AI: ${ai.shortlistStatus || "Pending"}`}
                                />
                                {recommendation && <StatusBadge status={recommendation} />}
                            </div>
                        </div>
                        <div className="av-app-id">
                            {ap.applicationId && (
                                <>
                                    <span className="av-app-id-label">Application ID</span>
                                    <span className="av-app-id-value">{ap.applicationId}</span>
                                </>
                            )}
                            {ap.refNo && (
                                <>
                                    <span className="av-app-id-label">Ref. No.</span>
                                    <span className="av-app-id-value">{ap.refNo}</span>
                                </>
                            )}
                            {ap.appliedAt && (
                                <span className="av-app-id-label" style={{ textTransform: "none" }}>
                                    Applied {formatOnlyDate(ap.appliedAt)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Vacancy ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Briefcase size={14} /> Vacancy applied for</div>
                        <div className="lv-rows">
                            <LvRow label="Position" value={pos.title} />
                            <LvRow label="Cadre" value={pos.cadre} />
                            <LvRow label="Department" value={pos.department ?? ap.department} />
                            <LvRow
                                label="Experience required"
                                value={
                                    pos.requiredYearsExperience !== undefined && pos.requiredYearsExperience !== null
                                        ? `${pos.requiredYearsExperience} year${pos.requiredYearsExperience === 1 ? "" : "s"}`
                                        : null
                                }
                            />
                            <LvRow label="Deadline" value={job.applicationDeadline ? formatDate(job.applicationDeadline) : null} />
                            {job.isActive !== undefined && (
                                <LvRow label="Vacancy" value={<StatusBadge status={job.isActive ? "Active" : "Inactive"} />} />
                            )}
                        </div>
                        {job.description && <p className="av-job-desc">{job.description}</p>}
                        {requirements.length > 0 && (
                            <>
                                <p className="av-missing-label" style={{ marginTop: 12 }}>Requirements</p>
                                <ul className="av-list">
                                    {requirements.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="lv-grid">
                        {/* ── Personal ── */}
                        <div className="lv-card">
                            <div className="lv-card-head"><User size={14} /> Personal information</div>
                            <div className="lv-rows">
                                <LvRow label="First name" value={pi.firstName} />
                                {pi.middleName && <LvRow label="Middle name" value={pi.middleName} />}
                                <LvRow label="Last name" value={pi.lastName} />
                                <LvRow label="Date of birth" value={pi.dateOfBirth ? formatOnlyDate(pi.dateOfBirth) : null} />
                                <LvRow label="Gender" value={capitalize(pi.gender)} />
                                <LvRow label="Marital status" value={capitalize(pi.maritalStatus)} />
                                <LvRow label="State of origin" value={ap.stateOfOrigin ?? pi.stateOfOrigin} />
                                <LvRow label="LGA" value={ap.lga ?? pi.lga} />
                            </div>
                        </div>

                        {/* ── Interview ── */}
                        <div className="lv-card">
                            <div className="lv-card-head"><Calendar size={14} /> Interview</div>
                            <div className="lv-rows">
                                <LvRow label="Interview date" value={ap.interviewDate ? formatDate(ap.interviewDate) : "Not scheduled"} />
                                <LvRow
                                    label="Invitation"
                                    value={
                                        ap.inviteSent ? (
                                            <span className="av-chip"><MailCheck size={11} /> Invite sent</span>
                                        ) : (
                                            "Not sent"
                                        )
                                    }
                                />
                                <LvRow label="Ref. No." value={ap.refNo} />
                                <LvRow label="Applied" value={ap.appliedAt ? formatDate(ap.appliedAt) : null} />
                            </div>
                        </div>
                    </div>

                    {/* ── AI assessment ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><Award size={14} /> AI assessment</div>
                        {scored ? (
                            <>
                                <div className="av-ai-top">
                                    <div className="av-ai-overall">
                                        <span className="av-ai-overall-num">{ai.overallScore}</span>
                                        <span className="av-ai-overall-label">overall / 100</span>
                                    </div>
                                    <div className="av-badges">
                                        {recommendation && <StatusBadge status={recommendation} />}
                                        <StatusBadge status={ai.shortlistStatus || "Pending"} />
                                    </div>
                                </div>
                                <div className="av-score-grid">
                                    <ScoreBar label="Qualifications" value={ai.qualificationScore} />
                                    <ScoreBar label="Experience" value={ai.experienceScore} />
                                    <ScoreBar label="Publications" value={ai.publicationScore} />
                                    <ScoreBar label="Professional" value={ai.professionalScore} />
                                </div>
                                {Array.isArray(ai.missingRequirements) && (
                                    <>
                                        <p className="av-missing-label" style={{ marginTop: 14 }}>Missing requirements</p>
                                        {ai.missingRequirements.length ? (
                                            <ul className="av-list">
                                                {ai.missingRequirements.map((r, i) => (
                                                    <li key={i} className="av-missing-item">
                                                        <AlertCircle size={12} /> {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="lv-no-subjects">None — every listed requirement is met.</p>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="lv-no-subjects">
                                Not scored yet. Scores appear after a shortlist is generated for this vacancy.
                            </p>
                        )}
                    </div>

                    {/* ── Qualifications ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><GraduationCap size={14} /> Qualifications</div>
                        {degrees.length ? (
                            <div className="av-degree-list">
                                {degrees.map((d, i) => (
                                    <div key={i} className="av-degree-card">
                                        <span className="av-degree-type">{degreeLabel(d.degreeType) || "Degree"}</span>
                                        <div className="av-degree-body">
                                            <span className="av-degree-inst">{d.institution || "—"}</span>
                                            {(d.programme || d.department) && (
                                                <span className="av-degree-year">
                                                    {[d.programme, d.department && d.department !== d.programme ? d.department : null]
                                                        .filter(Boolean)
                                                        .join(" · ")
                                                        .replace(/_/g, " ")}
                                                </span>
                                            )}
                                        </div>
                                        <span className="av-degree-year">
                                            {[d.degreeClass, d.yearAwarded].filter(Boolean).join(" · ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="lv-no-subjects">No degrees listed.</p>
                        )}
                    </div>

                    <div className="lv-grid">
                        {/* ── Experience ── */}
                        <div className="lv-card">
                            <div className="lv-card-head"><Layers size={14} /> Experience</div>
                            <div className="lv-rows">
                                <LvRow label="Teaching" value={`${exp.teachingYears ?? 0} yrs`} />
                                <LvRow label="Research" value={`${exp.researchYears ?? 0} yrs`} />
                                <LvRow label="Industry" value={`${exp.industryYears ?? 0} yrs`} />
                                <LvRow label="Post-qualification" value={`${exp.postQualificationExperience ?? 0} yrs`} />
                                <LvRow label="Publications" value={exp.publications ?? 0} />
                            </div>
                        </div>

                        {/* ── Professional ── */}
                        <div className="lv-card">
                            <div className="lv-card-head"><ShieldCheck size={14} /> Professional</div>
                            <div className="lv-rows">
                                <LvRow
                                    label="ICT proficient"
                                    value={pro.ictProficiency === undefined ? null : pro.ictProficiency ? "Yes" : "No"}
                                />
                            </div>
                            {pro.computerSkills?.length > 0 && (
                                <>
                                    <p className="av-missing-label" style={{ marginTop: 12 }}>Computer skills</p>
                                    <div className="av-tag-list">
                                        {pro.computerSkills.map((s, i) => <span key={i} className="av-tag">{s}</span>)}
                                    </div>
                                </>
                            )}
                            {pro.certifications?.length > 0 && (
                                <>
                                    <p className="av-missing-label" style={{ marginTop: 12 }}>Certifications</p>
                                    <div className="av-tag-list">
                                        {pro.certifications.map((c, i) => <span key={i} className="av-tag">{c}</span>)}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Documents ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><FileText size={14} /> Documents</div>
                        {docLinks.length ? (
                            <div className="av-doc-list">
                                {docLinks.map(({ label, url }) => (
                                    <a key={label} href={url} target="_blank" rel="noreferrer" className="av-doc-link">
                                        <FileText size={14} /> {label} <ExternalLink size={12} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="lv-no-subjects">No documents uploaded.</p>
                        )}
                    </div>

                    {/* ── Referees ── */}
                    <div className="lv-card">
                        <div className="lv-card-head" style={{ justifyContent: "space-between" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Users size={14} /> Referees
                            </span>
                            <span>{submittedRefs}/{REFEREE_COUNT} submitted</span>
                        </div>
                        {referees.length ? (
                            <div className="av-referee-list">
                                {referees.map((r, i) => <RefereeCard key={r.email ?? i} referee={r} ap={ap} />)}
                            </div>
                        ) : (
                            <p className="lv-no-subjects">No referees on record.</p>
                        )}
                    </div>

                    {/* ── Admin notes ── */}
                    <div className="lv-card">
                        <div className="lv-card-head"><StickyNote size={14} /> Admin notes</div>
                        {ap.adminNotes ? (
                            <p className="av-notes">{ap.adminNotes}</p>
                        ) : (
                            <p className="lv-no-subjects">
                                No notes yet.{writer ? " Notes added when updating the status appear here." : ""}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </CustomModal>
    );
}

export default JobApplicantView;
