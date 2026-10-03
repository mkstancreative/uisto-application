import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Layers,
  ListChecks,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useJob } from "../../../hooks/useJobs";
import { useAllSubcadres } from "../../../hooks/useConfig";
import { errorMessage } from "../../../api/api";
import { formatDate, formatDeadline } from "../../../utils/helpers";
import { daysUntil, deadlineLabel } from "../common/dates";
import { makeSubcadreName } from "../common/refs";
import "./LecturerView.css";
import "../common/adminCommon.css";

function JobView({ id, closeModal }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error, refetch } = useJob(id);
  const { data: subRes } = useAllSubcadres();
  const subcadreName = useMemo(() => makeSubcadreName(subRes?.data ?? []), [subRes]);
  const job = response?.data;
  const position = job?.position ?? {};

  const go = (path) => {
    closeModal();
    navigate(path);
  };

  const days = daysUntil(job?.applicationDeadline);
  const subcadre = subcadreName(position.subcadre);

  return (
    <CustomModal
      isOpen
      title="Vacancy Details"
      subtitle={isLoading ? "Loading…" : (position.title ?? "—")}
      size="wide"
      onClose={closeModal}
      footer={
        <div className="modal-footer-wrap">
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Close
          </button>
          {job && (
            <>
              <button
                type="button"
                className="modal-cancel"
                onClick={() => go(`/admin/applications?jobId=${encodeURIComponent(job._id)}`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ClipboardList size={14} /> View applications
              </button>
              <button
                type="button"
                className="modal-submit"
                onClick={() => go(`/admin/shortlist?jobId=${encodeURIComponent(job._id)}`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ListChecks size={14} /> Shortlist
              </button>
            </>
          )}
        </div>
      }
    >
      {isLoading && (
        <div className="lv-loader">
          <div className="spinner" />
          <p>Loading vacancy…</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className="lv-loader">
          <AlertTriangle size={28} color="#ef4444" />
          <p style={{ color: "#ef4444", fontWeight: 600 }}>Could not load this vacancy.</p>
          <p style={{ fontSize: 12 }}>{errorMessage(error)}</p>
          <button type="button" className="modal-cancel" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && !job && (
        <div className="lv-loader">
          <p>Vacancy not found.</p>
        </div>
      )}

      {!isLoading && !isError && job && (
        <div className="lv-wrapper">
          {/* ── Hero ── */}
          <div className="lv-hero">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "rgba(var(--accent-rgb), 0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-ink)",
                flexShrink: 0,
              }}
            >
              <Briefcase size={26} strokeWidth={1.6} />
            </div>
            <div className="lv-hero-info">
              <h3 className="lv-name">{position.title ?? "Untitled position"}</h3>
              <span className="lv-email">
                <Award size={13} /> {position.cadre ?? "—"}
              </span>
              {position.department && (
                <span className="lv-email">
                  <BookOpen size={13} /> Department: {position.department}
                </span>
              )}
              {subcadre && (
                <span className="lv-email">
                  <Layers size={13} /> Subcadre: {subcadre}
                </span>
              )}
              <div className="lv-status-row">
                <StatusBadge status={job.isOpen ? "Open" : "Closed"} />
                <StatusBadge status={job.isActive ? "Active" : "Inactive"} />
              </div>
            </div>
          </div>

          {/* ── Overview ── */}
          <div className="lv-card">
            <div className="lv-card-head">
              <Calendar size={14} /> Overview
            </div>
            <div className="lv-rows">
              <LvRow label="Published" value={job.publishedDate ? formatDate(job.publishedDate) : "—"} />
              <LvRow
                label="Deadline"
                value={
                  job.applicationDeadline ? (
                    <span className="cell-stack" style={{ justifyContent: "flex-end" }}>
                      {formatDeadline(job.applicationDeadline)}
                      <span className={`tag ${days < 0 ? "tag-red" : days <= 3 ? "tag-amber" : "tag-slate"}`}>
                        {deadlineLabel(job.applicationDeadline)}
                      </span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <LvRow label="Accepting applications" value={job.isOpen ? "Yes" : "No"} />
              <LvRow label="Active" value={job.isActive ? "Yes" : "No (closed by staff)"} />
            </div>
          </div>

          {/* ── Description ── */}
          <div className="lv-card">
            <div className="lv-card-head">
              <BookOpen size={14} /> Description
            </div>
            <p className="cell-sub" style={{ fontSize: 13, lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
              {job.description || "No description."}
            </p>
          </div>

          {/* ── Requirements ── */}
          <div className="lv-card">
            <div className="lv-card-head">
              <CheckCircle2 size={14} /> Position Requirements
            </div>
            <ChipList items={position.requirements} empty="None set on the position." />
          </div>

          <div className="lv-card">
            <div className="lv-card-head">
              <CheckCircle2 size={14} /> Extra Requirements (this vacancy only)
            </div>
            <ChipList items={job.extraRequirements} empty="No extra requirements." />
          </div>
        </div>
      )}
    </CustomModal>
  );
}

function ChipList({ items, empty }) {
  const list = (items ?? []).map((r) => (typeof r === "object" ? r?.name : r)).filter(Boolean);
  if (!list.length) return <p className="lv-no-subjects">{empty}</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {list.map((r, i) => (
        <span key={`${r}-${i}`} className="lv-chip">
          {r}
        </span>
      ))}
    </div>
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
