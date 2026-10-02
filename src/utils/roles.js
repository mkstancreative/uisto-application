/* ════════════════════════════════════════
   Staff roles (from the API)
   hrm        → everything, including staff accounts
   registrar  → all reads + writes (jobs, shortlists, application status)
   hoc        → read-only
   viewer     → read-only
════════════════════════════════════════ */
export const ROLE_LABELS = {
  hrm: 'HR Manager',
  registrar: 'Registrar',
  hoc: 'HOC',
  viewer: 'Viewer',
};

/** Roles an HR manager may assign over the API (hrm is server-only). */
export const ASSIGNABLE_ROLES = ['registrar', 'hoc', 'viewer'];

export const STAFF_ROLES = Object.keys(ROLE_LABELS);

export const roleLabel = (role) => ROLE_LABELS[role] ?? role ?? 'Staff';

/** Create/update jobs, configuration, shortlists and application status. */
export const canWrite = (user) => ['hrm', 'registrar'].includes(user?.role);

/** Manage staff accounts. */
export const canManageStaff = (user) => user?.role === 'hrm';

export const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
