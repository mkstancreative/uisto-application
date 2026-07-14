export const ROLE_ID_MAP = {
  1: 'Admin',
  2: 'Student',
  3: 'Lecturer',
  4: 'Rector',
  5: 'Super Admin',
  6: 'Secretary',
  7: 'Bursar',
};

export const ROLE_ID_TO_PATH = {
  1: '/admin', // Admin
  2: '/student', // Student
  3: '/lecturer', // Lecturer
  4: '/admin', // Rector  (administrative — shares admin portal)
  5: '/admin', // Super Admin
  6: '/registrar', // Secretary (registrar-level access)
  7: '/bursar', // Bursar
};

export const PORTAL_ROLE_IDS = {
  admin: [1, 4, 5], // Admin, Rector, Super Admin
  registrar: [6], // Secretary
  bursar: [7], // Bursar
  lecturer: [3], // Lecturer
  student: [2], // Student
};

export const PRIVILEGE_IDS = {
  ADMISSION: 1,
  STUDENT: 2,
  RESULT: 3,
  REPORT: 4,
  TRANSCRIPT: 5,
  SETTING: 6,
  ADMIN: 7,
  NEWS_EVENTS: 8,
  HRM: 9,
  HOSTELS: 10,
  MANAGE_EMAILS: 11,
};

export const getPathForRoleId = (roleId) => ROLE_ID_TO_PATH[roleId] ?? '/';

export const getRoleName = (roleId) => ROLE_ID_MAP[roleId] ?? 'Unknown';

export const resolveRole = (data) => {
  if (data?.role?.name) return data.role.name;
  return ROLE_ID_MAP[data?.user?.role_id] ?? 'Unknown';
};

export const normaliseUser = (data) => {
  const { user, admin, settings } = data ?? {};

  return {
    /* Identity */
    id: user?.id,
    email: user?.email,
    firstname: user?.firstname,
    lastname: user?.lastname,
    name: `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim(),
    userstatus: user?.userstatus,

    /* Role — keep role_id as the primary key for routing/guards */
    role_id: user?.role_id,
    role: resolveRole(data), // display name: "Super Admin", "Bursar" etc.

    /* Privileges */
    admin: admin ?? null,
    privileges: admin?.privileges ?? [], // [{ id, name }, ...]
    privilegeIds: (admin?.privileges ?? []).map((p) => p.id), // [1, 2, 3, ...]
    apiKey: admin?.apiKey ?? null, // API key for Authorization header

    /* Session */
    settings: settings ?? null,
  };
};

export const getInitials = (first = '', last = '') => {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '??';
};
