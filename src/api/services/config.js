import api from '../api';
import { clean } from './params';

/* Reference data — reads need any staff role; writes need registrar/hrm. */

/* ── Positions ── */
export const getPositions = async (params) => {
  const res = await api.get('/positions', { params: clean(params) });
  return res.data;
};

export const getPosition = async (id) => {
  const res = await api.get(`/positions/${id}`);
  return res.data;
};

export const createPosition = async (data) => {
  const res = await api.post('/positions', clean(data));
  return res.data;
};

/** cadre cannot change after creation, so it is never sent. */
export const updatePosition = async ({ id, title, department, subcadre, requirements, requiredYearsExperience }) => {
  const res = await api.put(`/positions/${id}`, {
    title,
    department,
    subcadre,
    requirements,
    requiredYearsExperience,
  });
  return res.data;
};

export const reorderPosition = async ({ id, newOrder }) => {
  const res = await api.patch(`/positions/${id}/reorder`, { newOrder });
  return res.data;
};

export const deletePosition = async (id) => {
  const res = await api.delete(`/positions/${id}`);
  return res.data;
};

/* ── Requirements ── */
export const getRequirements = async (params) => {
  const res = await api.get('/requirements', { params: clean(params) });
  return res.data;
};

export const createRequirement = async ({ name, cadre }) => {
  const res = await api.post('/requirements', { name, cadre });
  return res.data;
};

export const updateRequirement = async ({ id, name, cadre }) => {
  const res = await api.put(`/requirements/${id}`, { name, cadre });
  return res.data;
};

export const toggleRequirement = async (id) => {
  const res = await api.patch(`/requirements/${id}/toggle`);
  return res.data;
};

export const deleteRequirement = async (id) => {
  const res = await api.delete(`/requirements/${id}`);
  return res.data;
};

/* ── Subcadres ── */
export const getSubcadres = async (params) => {
  const res = await api.get('/subcadres', { params: clean(params) });
  return res.data;
};

export const createSubcadre = async ({ name }) => {
  const res = await api.post('/subcadres', { name });
  return res.data;
};

export const updateSubcadre = async ({ id, name }) => {
  const res = await api.put(`/subcadres/${id}`, { name });
  return res.data;
};

export const toggleSubcadre = async (id) => {
  const res = await api.patch(`/subcadres/${id}/toggle`);
  return res.data;
};

export const deleteSubcadre = async (id) => {
  const res = await api.delete(`/subcadres/${id}`);
  return res.data;
};
