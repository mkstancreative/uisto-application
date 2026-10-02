import api from '../api';
import { clean } from './params';

/* ════════════════════════════════════════
   Public careers site — no credentials required
════════════════════════════════════════ */

export const getVacancies = async (params) => {
  const res = await api.get('/careers', { params: clean(params) });
  return res.data;
};

export const getVacancy = async (jobId) => {
  const res = await api.get(`/careers/${jobId}`);
  return res.data;
};

export const verifyNin = async (nin) => {
  const res = await api.post('/verify-nin', { nin });
  return res.data;
};

/**
 * Submit an application. Nested objects travel as JSON strings inside the
 * multipart body; the three documents are optional File objects.
 */
export const submitApplication = async ({
  jobId,
  department,
  personalInfo,
  qualifications,
  experience,
  professionalInfo,
  referees,
  files = {},
}, { onUploadProgress } = {}) => {
  const form = new FormData();
  form.append('jobId', jobId);
  if (department) form.append('department', department);
  form.append('personalInfo', JSON.stringify(personalInfo));
  form.append('qualifications', JSON.stringify(qualifications));
  form.append('experience', JSON.stringify(experience));
  form.append('professionalInfo', JSON.stringify(professionalInfo));
  form.append('referees', JSON.stringify(referees));
  ['coverLetter', 'resume', 'supportingDocument'].forEach((key) => {
    if (files[key]) form.append(key, files[key]);
  });
  const res = await api.post('/applications/apply', form, { onUploadProgress });
  return res.data;
};

export const getApplicationStatus = async ({ applicationId, email }) => {
  const res = await api.get(
    `/applications/status/${encodeURIComponent(applicationId.trim())}`,
    { params: { email: email.trim() } },
  );
  return res.data;
};

/* ════════════════════════════════════════
   Magic links — the token in the URL is the credential
════════════════════════════════════════ */

/** Returns a bare object (no success/data envelope). */
export const getRefereeForm = async (token) => {
  const res = await api.get(`/referee/${encodeURIComponent(token)}`);
  return res.data;
};

export const submitReference = async ({ token, referenceText, referenceFile }) => {
  const form = new FormData();
  if (referenceText?.trim()) form.append('referenceText', referenceText.trim());
  if (referenceFile) form.append('referenceFile', referenceFile);
  const res = await api.post(`/referee/${encodeURIComponent(token)}`, form);
  return res.data;
};

export const getOriginData = async (token) => {
  const res = await api.get(`/origin-data/${encodeURIComponent(token)}`);
  return res.data;
};

export const submitOriginData = async ({ token, stateOfOrigin, lga }) => {
  const res = await api.patch(`/origin-data/${encodeURIComponent(token)}`, { stateOfOrigin, lga });
  return res.data;
};
