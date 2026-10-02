import api from '../api';
import { clean } from './params';

/* Staff accounts — every call here requires the hrm role. */

export const getStaffUsers = async (params) => {
  const res = await api.get('/auth/users', { params: clean(params) });
  return res.data;
};

export const getStaffUser = async (id) => {
  const res = await api.get(`/auth/users/${id}`);
  return res.data;
};

export const createStaffUser = async ({ name, email, password, role, department }) => {
  const res = await api.post('/auth/register', { name, email, password, role, department });
  return res.data;
};

export const updateStaffUser = async ({ id, ...data }) => {
  const res = await api.patch(`/auth/users/${id}`, data);
  return res.data;
};

export const resetStaffPassword = async ({ id, temporaryPassword }) => {
  const res = await api.post(`/auth/users/${id}/reset-password`, { temporaryPassword });
  return res.data;
};

export const deleteStaffUser = async (id) => {
  const res = await api.delete(`/auth/users/${id}`);
  return res.data;
};
