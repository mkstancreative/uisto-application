import axios from 'axios';
import {
  API_BASE,
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  refreshSession,
} from './session';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

/* Attach the access token to every request */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalised error every service call rejects with. */
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const toApiError = (error) => {
  if (error instanceof ApiError) return error;
  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED';
    return new ApiError(
      timedOut
        ? 'The server took too long to respond. Please try again.'
        : 'Network error. Please check your connection.',
      { status: 0 },
    );
  }
  const { status, data } = error.response;
  const fallback =
    status >= 500
      ? 'Server error. Please try again later.'
      : status === 403
        ? 'You do not have permission to perform this action.'
        : 'Something went wrong. Please try again.';
  return new ApiError(data?.message || fallback, { status, data });
};

/*
  On 401: refresh once, then retry the original request.
  If the refresh fails, the session is over — clear it and tell the app.
*/
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuthRefresh &&
      getRefreshToken()
    ) {
      original._retry = true;
      try {
        const { accessToken } = await refreshSession();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        notifySessionExpired();
        return Promise.reject(
          new ApiError('Your session has expired. Please sign in again.', { status: 401 }),
        );
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/** Human-readable message for any error thrown by a service call. */
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err) return fallback;
  const reqs = err.data?.requirements;
  if (Array.isArray(reqs) && reqs.length) {
    return `Password must ${reqs.join(', ')}.`;
  }
  return err.message || fallback;
};

export default api;
