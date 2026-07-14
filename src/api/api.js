import axios from 'axios';
import qs from 'qs';

export const BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://application.uisto.edu.ng/backend/';

export const CAREER_BASE_URL = 'https://career-portal-uisto.onrender.com/api/v1/';
// export const CAREER_BASE_URL = 'https://career.uisto.edu.ng/api/v1/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  // FIX 1: Prevent &amp; encoding globally for all requests
  paramsSerializer: (params) => qs.stringify(params, { encode: false }),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const careerApi = axios.create({
  baseURL: CAREER_BASE_URL,
  timeout: 30000,
  // FIX 1: Same fix for careerApi
  paramsSerializer: (params) => qs.stringify(params, { encode: false }),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const attachInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => {
      const contentType = response.headers?.['content-type'] ?? '';
      const isHtml = contentType.includes('text/html');
      const bodyIsHtml =
        typeof response.data === 'string' &&
        response.data.trimStart().startsWith('<');

      if (isHtml || bodyIsHtml) {
        const responseUrl = response?.request?.responseURL || '';
        if (
          responseUrl.toLowerCase().includes('login') ||
          response.status === 401
        ) {
          try {
            localStorage.removeItem('ems_auth');
            window.dispatchEvent(new Event('ems:unauthorized'));
          } catch (e) {
            console.error(e);
          }
          return Promise.reject({
            message: 'Your session has expired. Please log in again.',
            status: 401,
            isHtmlError: true,
          });
        } else {
          return Promise.reject({
            message: 'Server error.',
            status: response.status || 500,
            isHtmlError: true,
          });
        }
      }

      const sessionExpiredMessages = [
        'session expired',
        'unauthenticated',
        'not logged in',
        'login required',
      ];
      const bodyMessage = (
        response.data?.message ??
        response.data?.error ??
        ''
      ).toLowerCase();

      if (sessionExpiredMessages.some((m) => bodyMessage.includes(m))) {
        try {
          localStorage.removeItem('ems_auth');
          window.dispatchEvent(new Event('ems:unauthorized'));
        } catch (e) {
          console.log(e);
        }
        return Promise.reject({
          message: 'Your session has expired. Please log in again.',
          status: 401,
        });
      }

      return response;
    },

    async (error) => {
      if (!error.response) {
        // FIX 2: `data` was referenced before being defined — was always undefined
        return Promise.reject({
          message: error?.message || 'Network error. Please check your connection.',
        });
      }

      const { status, data } = error.response;

      if (status === 401) {
        try {
          localStorage.removeItem('ems_auth');
          window.dispatchEvent(new Event('ems:unauthorized'));
        } catch (e) {
          console.log(e);
        }
      }

      if (status === 403) {
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
        });
      }

      if (status >= 500) {
        return Promise.reject({
          message: 'Server error. Please try again later.',
        });
      }

      // FIX 3: Also forward the raw `data` so callers can inspect the
      // original CakePHP error body (the "Missing passed parameter" message
      // was being swallowed here before)
      return Promise.reject({
        message:
          data?.message ||
          data?.error ||
          'Something went wrong. Please try again.',
        status,
        data,
      });
    },
  );
};

attachInterceptors(api);
attachInterceptors(careerApi);

export default api;
export { careerApi };