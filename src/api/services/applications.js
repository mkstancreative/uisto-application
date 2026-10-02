import api from '../api';
import { clean } from './params';

/* Recruitment dashboard — reads need any staff role; status changes need registrar/hrm. */

export const getApplications = async (params) => {
  const res = await api.get('/admin/applications', { params: clean(params) });
  return res.data;
};

/** Takes the Mongo _id, not the human-readable UISTO-… id. */
export const getApplication = async (id) => {
  const res = await api.get(`/admin/applications/${id}`);
  return res.data;
};

export const updateApplicationStatus = async ({ id, status, notes }) => {
  const res = await api.patch(`/admin/applications/${id}/status`, clean({ status, notes }));
  return res.data;
};

export const getStatistics = async () => {
  const res = await api.get('/admin/statistics');
  return res.data;
};

/** Returns a bare object (no success/data envelope). */
export const getReferenceSummary = async () => {
  const res = await api.get('/admin/reference-summary');
  return res.data;
};
