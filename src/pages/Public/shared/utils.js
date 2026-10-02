/* Helpers shared by the public careers pages. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (v) => EMAIL_RE.test(String(v ?? '').trim());

/* ── Documents (PDF / DOC / DOCX, 10 MB) ── */
export const DOC_EXTENSIONS = ['pdf', 'doc', 'docx'];
export const DOC_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const MAX_DOC_BYTES = 10 * 1024 * 1024;

export const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/** Returns an error message, or null when the file is acceptable. */
export const validateDoc = (file) => {
  if (!file) return null;
  const ext = String(file.name ?? '').split('.').pop().toLowerCase();
  if (!DOC_EXTENSIONS.includes(ext)) return 'Only PDF, DOC and DOCX files are allowed.';
  if (file.size > MAX_DOC_BYTES) return `File is ${formatBytes(file.size)}. The maximum size is 10 MB.`;
  if (file.size === 0) return 'This file is empty.';
  return null;
};

/* ── Vacancy display ── */

/** Subcadre arrives populated ({ _id, name }), as a bare id, or null. */
export const subcadreName = (subcadre) =>
  subcadre && typeof subcadre === 'object' ? subcadre.name ?? '' : '';

export const subcadreId = (subcadre) =>
  subcadre && typeof subcadre === 'object' ? subcadre._id ?? '' : subcadre ?? '';

/** "Department of …" for academic roles, subcadre for non-academic ones. */
export const vacancyUnit = (job) => job?.department || subcadreName(job?.subcadre) || '';

const ymdKey = (y, m, d) => Date.UTC(y, m, d) / 86400000;

/**
 * Deadlines are stored as end-of-day UTC ("2026-11-30T23:59:59Z"), so the
 * calendar date is read in UTC; otherwise West Africa (UTC+1) would show
 * the following day.
 */
export const formatDeadline = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** { label, tone } where tone ∈ open | soon | today | closed */
export const deadlineStatus = (iso, now = new Date()) => {
  if (!iso) return { label: 'Open', tone: 'open' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: 'Open', tone: 'open' };
  if (d.getTime() < now.getTime()) return { label: 'Closed', tone: 'closed' };
  const days =
    ymdKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
    ymdKey(now.getFullYear(), now.getMonth(), now.getDate());
  if (days <= 0) return { label: 'Closes today', tone: 'today' };
  if (days === 1) return { label: '1 day left', tone: 'soon' };
  return { label: `${days} days left`, tone: days <= 7 ? 'soon' : 'open' };
};

export const formatDay = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Text ── */

/** "CHINEDU EMEKA" → "Chinedu Emeka"; mixed-case input is left alone. */
export const titleCaseIfCaps = (value) => {
  const s = String(value ?? '').trim();
  if (!s || s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
};

/* ── localStorage (may throw in private mode / when blocked) ── */
export const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — drafts are a convenience only */
  }
};

export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

/* ── Nigerian states: match stored values to the select options ── */
const norm = (s) => String(s ?? '').replace(/[\s-]+/g, '').toLowerCase();

export const matchOption = (value, options) =>
  options.find((o) => norm(o) === norm(value)) ?? '';
