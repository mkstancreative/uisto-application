import api from '../api';
import { clean } from './params';

/* ════════════════════════════════════════
   Public careers site — no credentials required
════════════════════════════════════════ */

/* ── Vacancy shape ──────────────────────────────────────────────
   The collection documents a flat vacancy ({ title, cadre, department,
   subcadre, requirements, … }). The deployed server returns the /jobs shape
   instead ({ position: { title, … }, extraRequirements }), and its subcadre
   objects carry no _id. Normalise both into the documented shape. */
const SUBCADRE_NAME_KEY = 'name:';

const toSubcadre = (subcadre) => {
  if (!subcadre || typeof subcadre !== 'object') return subcadre ?? null;
  if (subcadre._id) return subcadre;
  // No id to filter by, so key the subcadre by its name (filtered client-side)
  return subcadre.name ? { ...subcadre, _id: `${SUBCADRE_NAME_KEY}${subcadre.name}` } : null;
};

const reqName = (r) => (typeof r === 'string' ? r : r?.name);

export const toVacancy = (job) => {
  if (!job || typeof job.position !== 'object' || job.position === null) {
    return job ? { ...job, subcadre: toSubcadre(job.subcadre) } : job;
  }
  const p = job.position;
  return {
    _id: job._id,
    title: p.title,
    cadre: p.cadre,
    department: p.department ?? null,
    subcadre: toSubcadre(p.subcadre),
    requiredYearsExperience: p.requiredYearsExperience,
    description: job.description,
    requirements: [...(p.requirements ?? []), ...(job.extraRequirements ?? [])]
      .map(reqName)
      .filter(Boolean),
    applicationDeadline: job.applicationDeadline,
    publishedDate: job.publishedDate,
    isOpen: job.isOpen ?? job.isActive,
  };
};

const normaliseList = (body) => ({ ...body, data: (body?.data ?? []).map(toVacancy) });

/* The deployed server also insists on a cadre ("Cadre is required for
   filtering"). When no cadre is chosen, ask for each cadre and merge. */
const CADRES = ['Academic', 'Non-Academic'];
const needsCadre = (err) => err?.status === 400 && /cadre is required/i.test(err?.message ?? '');

const listAcrossCadres = async ({ page = 1, limit, cadre, subcadre, ...filters }) => {
  const byName = String(subcadre ?? '').startsWith(SUBCADRE_NAME_KEY);
  const responses = await Promise.all(
    (cadre ? [cadre] : CADRES).map((c) =>
      api.get('/careers', {
        params: clean({ ...filters, cadre: c, subcadre: byName ? undefined : subcadre }),
      }),
    ),
  );

  let all = responses.flatMap((res) => (res.data?.data ?? []).map(toVacancy));
  if (byName) {
    const name = subcadre.slice(SUBCADRE_NAME_KEY.length);
    all = all.filter((v) => v.subcadre?.name === name);
  }
  all.sort((a, b) => new Date(b.publishedDate ?? 0) - new Date(a.publishedDate ?? 0));

  const total = all.length;
  const per = Number(limit) || total || 1;
  const pages = Math.max(1, Math.ceil(total / per));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const data = limit ? all.slice((current - 1) * per, current * per) : all;
  return { success: true, page: current, limit: per, total, count: data.length, pages, data };
};

export const getVacancies = async (params = {}) => {
  if (!String(params.subcadre ?? '').startsWith(SUBCADRE_NAME_KEY)) {
    try {
      const res = await api.get('/careers', { params: clean(params) });
      return normaliseList(res.data);
    } catch (err) {
      if (!needsCadre(err)) throw err;
    }
  }
  return listAcrossCadres(params);
};

export const getVacancy = async (jobId) => {
  const res = await api.get(`/careers/${jobId}`);
  return { ...res.data, data: toVacancy(res.data?.data) };
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
