import { GoDotFill } from "react-icons/go";
import "./statusbage.css";

/*
 * Status text → colour tone. Lookup is normalised (lowercase, spaces and
 * underscores → hyphens), so "Under Review", "under_review" and
 * "under-review" all resolve the same way.
 */
const TONES = {
  // Application pipeline
  submitted: "blue",
  "under-review": "amber",
  shortlisted: "teal",
  "not-shortlisted": "slate",
  rejected: "red",
  interviewed: "violet",
  offered: "green",

  // AI shortlist status
  pending: "amber",
  "auto-shortlisted": "green",
  "manual-review": "violet",

  // AI recommendation
  "strongly-recommended": "green",
  recommended: "teal",
  "marginally-recommended": "amber",
  "not-recommended": "red",

  // Records / vacancies
  active: "green",
  inactive: "slate",
  open: "green",
  closed: "red",
  enabled: "green",
  disabled: "red",
  ended: "red",

  // Generic
  success: "green",
  completed: "green",
  failed: "red",
  awaiting: "amber",
  "in-progress": "amber",
};

const statusSlug = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

function StatusBadge({ status, category, type, label }) {
  const value = status ?? category ?? type;
  if (value === null || value === undefined || value === "") {
    return <span className="status-badge tone-slate">—</span>;
  }
  const slug = statusSlug(value);
  const tone = TONES[slug] ?? "slate";

  return (
    <span className={`status-badge tone-${tone} ${slug}`}>
      <GoDotFill className="status-dot" />
      <span>{label ?? String(value)}</span>
    </span>
  );
}

export default StatusBadge;
