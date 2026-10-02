import axios from 'axios';

/* ════════════════════════════════════════
   API location
   - VITE_API_URL is the server root (no trailing slash, no /api/v1).
   - Left empty in development so requests go through the Vite proxy.
════════════════════════════════════════ */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
export const API_BASE = `${API_ORIGIN}/api/v1`;

/** Turn a stored upload path ("/uploads/x.pdf" or an absolute disk path) into a URL. */
export const fileUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalised = String(path).replace(/\\/g, '/');
  const idx = normalised.indexOf('/uploads/');
  const rel = idx >= 0 ? normalised.slice(idx) : `/${normalised.replace(/^\/+/, '')}`;
  return `${API_ORIGIN}${rel}`;
};

/* ════════════════════════════════════════
   Token storage
   - Access token lives in memory only (1 hour lifetime).
   - Refresh token is persisted so a reload can restore the session.
════════════════════════════════════════ */
const REFRESH_KEY = 'uisto.refreshToken';
export const SESSION_EXPIRED_EVENT = 'auth:expired';

let accessToken = null;

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
};

export const hasStoredSession = () => Boolean(getRefreshToken());

export const setSession = ({ accessToken: access, refreshToken } = {}) => {
  accessToken = access ?? null;
  try {
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    /* storage unavailable — session will not survive a reload */
  }
};

export const clearSession = () => {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
};

export const REFRESH_STORAGE_KEY = REFRESH_KEY;

/* ════════════════════════════════════════
   Refresh
   Refresh tokens rotate, and replaying a consumed one revokes every
   session. So refreshes are de-duplicated within a tab and serialised
   across tabs with a Web Lock, re-reading the token inside the lock.
════════════════════════════════════════ */
const bare = axios.create({ baseURL: API_BASE, timeout: 30000 });

let inFlight = null;

const withLock = (fn) =>
  typeof navigator !== 'undefined' && navigator.locks?.request
    ? navigator.locks.request('uisto-auth-refresh', fn)
    : fn();

export const refreshSession = () => {
  if (!inFlight) {
    inFlight = withLock(async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No stored session');
      const res = await bare.post('/auth/refresh', { refreshToken });
      const data = res.data?.data;
      if (!data?.accessToken) throw new Error('Invalid refresh response');
      setSession(data);
      return data;
    }).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

export const notifySessionExpired = () => {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
