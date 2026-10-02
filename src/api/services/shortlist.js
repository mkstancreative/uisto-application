import api from '../api';
import { clean } from './params';

/* AI shortlisting — reads need any staff role; generating needs registrar/hrm. */

export const generateShortlist = async ({ jobId, minScore }) => {
  const res = await api.post('/shortlist', clean({ jobId, minScore }), { timeout: 180000 });
  return res.data;
};

export const getAllShortlistRuns = async (params) => {
  const res = await api.get('/shortlist/all', { params: clean(params) });
  return res.data;
};

export const getJobShortlistRuns = async (jobId, params) => {
  const res = await api.get(`/shortlist/${jobId}`, { params: clean(params) });
  return res.data;
};

export const getShortlistedCandidates = async (jobId, params) => {
  const res = await api.get(`/shortlist/${jobId}/candidates`, { params: clean(params) });
  return res.data;
};

/** JSON rows with CSV-style column names — the client builds the file. */
export const exportShortlist = async (jobId, params) => {
  const res = await api.get(`/shortlist/${jobId}/export`, { params: clean(params) });
  return res.data;
};
