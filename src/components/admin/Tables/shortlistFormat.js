/** Display helpers shared by the shortlist tables and pages. */

export const candidateName = (row) => {
  const pi = row?.personalInfo ?? {};
  const name = [pi.firstName, pi.middleName, pi.lastName].filter(Boolean).join(' ');
  return name || row?.fullName || '—';
};

export const formatRate = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(n % 1 ? 2 : 0)}%` : '—';
};
