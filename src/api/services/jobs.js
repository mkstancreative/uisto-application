import api from '../api';
import { clean } from './params';

/* Vacancies — reads are public; writes need registrar/hrm. */

export const getJobs = async (params) => {
  const res = await api.get('/jobs', { params: clean(params) });
  return res.data;
};

export const getJob = async (id) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const createJob = async ({ position, description, extraRequirements, applicationDeadline }) => {
  const res = await api.post('/jobs', clean({ position, description, extraRequirements, applicationDeadline }));
  return res.data;
};

/** Only description, deadline and extra requirements can change. */
export const updateJob = async ({ id, description, extraRequirements, applicationDeadline }) => {
  const res = await api.put(`/jobs/${id}`, clean({ description, extraRequirements, applicationDeadline }));
  return res.data;
};

/** Toggles isActive — the same call closes and reopens. */
export const toggleJob = async (id) => {
  const res = await api.patch(`/jobs/${id}/close`);
  return res.data;
};
