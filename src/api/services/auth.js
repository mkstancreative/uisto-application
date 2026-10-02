import api from '../api';
import { getRefreshToken } from '../session';

/* ── Sign-in & session ── */
export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password }, { skipAuthRefresh: true });
  return res.data;
};

/** Always resolves — the server answers 200 even for an unknown token. */
export const logout = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await api.post('/auth/logout', { refreshToken }, { skipAuthRefresh: true });
    return res.data;
  } catch {
    return null;
  }
};

export const logoutAll = async () => {
  const res = await api.post('/auth/logout-all');
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get('/auth/sessions');
  return res.data;
};

export const revokeSession = async (sessionId) => {
  const res = await api.delete(`/auth/sessions/${sessionId}`);
  return res.data;
};

/* ── Own profile ── */
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateMe = async ({ name, department }) => {
  const res = await api.patch('/auth/me', { name, department });
  return res.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword });
  return res.data;
};

/* ── Password recovery (public) ── */
export const forgotPassword = async ({ email }) => {
  const res = await api.post('/auth/forgot-password', { email }, { skipAuthRefresh: true });
  return res.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const res = await api.post(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    { newPassword },
    { skipAuthRefresh: true },
  );
  return res.data;
};
