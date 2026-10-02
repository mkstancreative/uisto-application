import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Eye, FileText, CheckCircle2, ClipboardList, XCircle, Hourglass, Percent, Gauge,
  BarChart3, Users, ArrowRight, ListChecks, Briefcase, Plus, AlertTriangle, History, Mail,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { useModal } from "../../../hooks/useModal";
import { useApplications, useReferenceSummary, useStatistics } from "../../../hooks/useApplications";
import StatusBadge from "../../../components/ui/StatusBadge/StatusBadge";
import JobApplicantView from "../../../components/admin/view/JobApplicantView";
import { canWrite, getInitials, roleLabel } from "../../../utils/roles";
import { formatNum, formatOnlyDate } from "../../../utils/helpers";
import { errorMessage } from "../../../api/api";
import "./Dashboard.css";

const TOP_VACANCIES = 8;

const greetingFor = (date) => {
  const h = date.getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function InlineError({ error, fallback, onRetry }) {
  return (
    <div className="adb-empty adb-error">
      <AlertTriangle size={20} />
      <span>{errorMessage(error, fallback)}</span>
      {onRetry && (
        <button type="button" className="adb-see-all" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ════════ KPI cards ════════ */
function KpiGrid({ stats, loading, error, onRetry }) {
  if (error) {
    return (
      <div className="adb-card">
        <InlineError error={error} fallback="Could not load statistics." onRetry={onRetry} />
      </div>
    );
  }

  const s = stats?.shortlistingStats ?? {};
  const rate = toNumber(s.shortlistingRate);
  const avg = toNumber(stats?.averageScore);
  const cards = [
    { label: "Total applications", value: formatNum(stats?.totalApplications ?? 0), icon: <FileText size={22} />, color: "var(--accent-ink)" },
    { label: "Auto-shortlisted", value: formatNum(s.autoShortlisted ?? 0), icon: <CheckCircle2 size={22} />, color: "#16a34a" },
    { label: "Manual review", value: formatNum(s.manualReview ?? 0), icon: <ClipboardList size={22} />, color: "#7c3aed" },
    { label: "Rejected by AI", value: formatNum(s.rejected ?? 0), icon: <XCircle size={22} />, color: "#dc2626" },
    { label: "Pending scoring", value: formatNum(s.pending ?? 0), icon: <Hourglass size={22} />, color: "#d97706" },
    { label: "Shortlisting rate", value: rate === null ? "—" : `${rate.toFixed(rate % 1 ? 2 : 0)}%`, icon: <Percent size={22} />, color: "var(--accent-ink)" },
    { label: "Average AI score", value: avg === null ? "—" : avg.toFixed(1), sub: "out of 100", icon: <Gauge size={22} />, color: "var(--accent-ink)" },
  ];

  return (
    <div className="adb-kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className="adb-kpi-card" style={{ "--kpi-color": c.color }}>
          <div className="adb-kpi-icon">{c.icon}</div>
          <div className="adb-kpi-body">
            {loading ? (
              <div className="adb-skeleton" style={{ height: 26, width: 70 }} />
            ) : (
              <span className="adb-kpi-value">{c.value}</span>
            )}
            <span className="adb-kpi-label">{c.label}</span>
            {c.sub && !loading && <span className="adb-kpi-sub">{c.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════ Applications per vacancy ════════ */
function VacancyTick({ x, y, payload }) {
  const text = String(payload?.value ?? "");
  const short = text.length > 18 ? `${text.slice(0, 17)}…` : text;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" className="adb-chart-tick">
      <title>{text}</title>
      {short}
    </text>
  );
}

function VacancyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="adb-chart-tooltip">
      <strong>{row.title}</strong>
      <span>
        {formatNum(row.count)} application{row.count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function VacancyChart({ stats, loading, error, onRetry }) {
  const navigate = useNavigate();
  const data = useMemo(
    () =>
      [...(stats?.applicationsPerJob ?? [])]
        .map((r) => ({ ...r, title: r.title || "Untitled vacancy", count: Number(r.count) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, TOP_VACANCIES),
    [stats],
  );
  const total = stats?.applicationsPerJob?.length ?? 0;

  return (
    <div className="adb-card">
      <div className="adb-card-header">
        <span className="adb-card-title">
          <BarChart3 size={15} /> Applications per vacancy
        </span>
        {total > TOP_VACANCIES && <span className="adb-card-meta">Top {TOP_VACANCIES} of {total}</span>}
      </div>
      <div className="adb-card-pad">
        {error ? (
          <InlineError error={error} fallback="Could not load vacancy figures." onRetry={onRetry} />
        ) : loading ? (
          <div className="adb-chart-skeleton">
            {[80, 64, 52, 40, 28].map((w) => (
              <div key={w} className="adb-skeleton" style={{ height: 16, width: `${w}%` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="adb-empty">
            <BarChart3 size={20} />
            <span>No applications yet.</span>
          </div>
        ) : (
          <div className="adb-chart" style={{ height: Math.max(140, data.length * 38 + 12) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={<VacancyTick />}
                  interval={0}
                />
                <Tooltip content={<VacancyTooltip />} cursor={{ fill: "rgba(var(--accent-rgb), 0.08)" }} />
                <Bar
                  dataKey="count"
                  fill="var(--accent-ink)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  isAnimationActive={false}
                  label={{ position: "right", className: "adb-chart-value" }}
                  onClick={(d) => {
                    const id = d?.jobId ?? d?.payload?.jobId;
                    if (id) navigate(`/admin/applications?jobId=${id}`);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <p className="adb-hint">Select a bar to see that vacancy's applications.</p>
        )}
      </div>
    </div>
  );
}

/* ════════ Reference submissions ════════ */
function ReferenceSummary({ summary, loading, error, onRetry }) {
  const buckets = [
    { key: "zeroReferenceSubmitted", label: "No references", n: 0 },
    { key: "oneReferenceSubmitted", label: "1 of 3", n: 1 },
    { key: "twoReferenceSubmitted", label: "2 of 3", n: 2 },
    { key: "threeReferenceSubmitted", label: "All 3", n: 3 },
  ].map((b) => ({ ...b, value: Number(summary?.[b.key]) || 0 }));
  const total = Number(summary?.totalApplications) || buckets.reduce((a, b) => a + b.value, 0);
  const needReminder = buckets.filter((b) => b.n < 3).reduce((a, b) => a + b.value, 0);

  return (
    <div className="adb-card">
      <div className="adb-card-header">
        <span className="adb-card-title">
          <Mail size={15} /> Reference submissions
        </span>
        {!loading && !error && <span className="adb-card-meta">{formatNum(total)} applications</span>}
      </div>
      <div className="adb-card-pad">
        {error ? (
          <InlineError error={error} fallback="Could not load the reference summary." onRetry={onRetry} />
        ) : loading ? (
          <>
            <div className="adb-skeleton" style={{ height: 14, width: "100%", borderRadius: 999 }} />
            <div className="adb-ref-grid" style={{ marginTop: 16 }}>
              {buckets.map((b) => (
                <div key={b.key} className="adb-skeleton" style={{ height: 52 }} />
              ))}
            </div>
          </>
        ) : total === 0 ? (
          <div className="adb-empty">
            <Mail size={20} />
            <span>No applications yet.</span>
          </div>
        ) : (
          <>
            <div
              className="adb-ref-bar"
              role="img"
              aria-label={buckets.map((b) => `${b.label}: ${b.value}`).join(", ")}
            >
              {buckets.map((b) =>
                b.value > 0 ? (
                  <span
                    key={b.key}
                    className={`adb-ref-seg adb-step-${b.n}`}
                    style={{ flexGrow: b.value }}
                    title={`${b.label}: ${formatNum(b.value)} (${Math.round((b.value / total) * 100)}%)`}
                  />
                ) : null,
              )}
            </div>
            <div className="adb-ref-grid">
              {buckets.map((b) => (
                <div key={b.key} className="adb-ref-stat">
                  <span className={`adb-ref-swatch adb-step-${b.n}`} />
                  <div>
                    <span className="adb-ref-value">{formatNum(b.value)}</span>
                    <span className="adb-ref-label">
                      {b.label} · {total ? Math.round((b.value / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {needReminder > 0 && (
              <p className="adb-hint">
                <AlertTriangle size={12} /> {formatNum(needReminder)} application{needReminder === 1 ? "" : "s"} still
                {needReminder === 1 ? " has" : " have"} 0–2 references in and may need a referee reminder.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════ Recent applications ════════ */
function RecentApplications() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { data: res, isLoading, isError, error, refetch } = useApplications({ page: 1, limit: 5, sort: "-createdAt" });
  const rows = res?.data ?? [];

  return (
    <div className="adb-card">
      <div className="adb-card-header">
        <span className="adb-card-title">
          <Users size={15} /> Recent applications
        </span>
        <button type="button" className="adb-see-all" onClick={() => navigate("/admin/applications")}>
          View all <ArrowRight size={12} />
        </button>
      </div>
      <div className="adb-card-body">
        {isError ? (
          <InlineError error={error} fallback="Could not load recent applications." onRetry={() => refetch()} />
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="adb-student-row">
              <div className="adb-skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="adb-skeleton" style={{ height: 12, width: "55%" }} />
                <div className="adb-skeleton" style={{ height: 10, width: "35%" }} />
              </div>
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="adb-empty">
            <Users size={20} />
            <span>No applications received yet.</span>
          </div>
        ) : (
          rows.map((ap) => (
            <button
              type="button"
              key={ap._id}
              className="adb-student-row adb-row-btn"
              onClick={() => openModal(<JobApplicantView id={ap._id} closeModal={closeModal} />)}
            >
              <div className="adb-student-avatar">{getInitials(ap.fullName)}</div>
              <div className="adb-student-info">
                <div className="adb-student-name">{ap.fullName || "—"}</div>
                <div className="adb-student-meta">
                  {ap.appliedAt ? `Applied ${formatOnlyDate(ap.appliedAt)}` : "Applied —"}
                  {ap.applicationId ? ` · ${ap.applicationId}` : ""}
                </div>
              </div>
              <StatusBadge status={ap.status || "Submitted"} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ════════ Quick links ════════ */
function QuickLinks({ writer }) {
  const navigate = useNavigate();
  const links = [
    { label: "Applications", icon: <ClipboardList size={20} />, to: "/admin/applications" },
    { label: "Shortlist by vacancy", icon: <ListChecks size={20} />, to: "/admin/shortlist" },
    { label: "Shortlist history", icon: <History size={20} />, to: "/admin/shortlist-history" },
    { label: "Vacancies", icon: <Briefcase size={20} />, to: "/admin/jobs" },
    ...(writer ? [{ label: "New vacancy", icon: <Plus size={20} />, to: "/admin/jobs", state: { create: true } }] : []),
  ];
  return (
    <div className="adb-card">
      <div className="adb-card-header">
        <span className="adb-card-title">
          <ArrowRight size={15} /> Quick links
        </span>
      </div>
      <div className="adb-card-pad">
        <div className="adb-quick-grid">
          {links.map((l) => (
            <button
              type="button"
              key={l.label}
              className="adb-quick-btn"
              onClick={() => navigate(l.to, l.state ? { state: l.state } : undefined)}
            >
              <span className="adb-quick-icon">{l.icon}</span>
              <span className="adb-quick-label">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════ Page ════════ */
function DashBoardAdmin() {
  const { user } = useAuth();
  const writer = canWrite(user);

  const statsQuery = useStatistics();
  const refQuery = useReferenceSummary();
  const stats = statsQuery.data?.data;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="page-container adb-root">
      {/* ════════ HERO ════════ */}
      <div className="adb-hero animate-fade-up">
        <div className="adb-hero-orb adb-orb-1" />
        <div className="adb-hero-orb adb-orb-2" />
        <div className="adb-hero-orb adb-orb-3" />

        <div className="adb-hero-inner">
          <div className="adb-hero-text">
            <p className="adb-hero-greeting">{greetingFor(now)}</p>
            <h1>{user?.name || "Welcome back"}</h1>
            <p>Here is where recruitment stands today.</p>
            <div className="adb-hero-badges">
              <span className="adb-hero-badge">
                <Shield size={11} /> {roleLabel(user?.role)}
              </span>
              {!writer && (
                <span className="adb-hero-badge">
                  <Eye size={11} /> Read-only access
                </span>
              )}
              {user?.department && <span className="adb-hero-badge">{user.department}</span>}
            </div>
          </div>
          <div className="adb-hero-date">
            <span>Today</span>
            <span className="adb-hero-day">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ════════ KPIs ════════ */}
      <section>
        <h2 className="adb-section-title">
          <Gauge size={15} /> Recruitment at a glance
        </h2>
        <KpiGrid
          stats={stats}
          loading={statsQuery.isLoading}
          error={statsQuery.isError ? statsQuery.error : null}
          onRetry={() => statsQuery.refetch()}
        />
      </section>

      <div className="adb-bottom-grid">
        <VacancyChart
          stats={stats}
          loading={statsQuery.isLoading}
          error={statsQuery.isError ? statsQuery.error : null}
          onRetry={() => statsQuery.refetch()}
        />
        <ReferenceSummary
          summary={refQuery.data}
          loading={refQuery.isLoading}
          error={refQuery.isError ? refQuery.error : null}
          onRetry={() => refQuery.refetch()}
        />
      </div>

      <div className="adb-bottom-grid">
        <RecentApplications />
        <QuickLinks writer={writer} />
      </div>
    </div>
  );
}

export default DashBoardAdmin;
