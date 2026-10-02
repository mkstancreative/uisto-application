/* State, validation, draft storage and payload building for the apply wizard. */
import { lgasFor, STATE_OPTIONS } from '../../../utils/nigeria';
import { isEmail, readStorage, removeStorage, validateDoc, writeStorage } from '../shared/utils';

export const STEPS = [
  { id: 'personal', label: 'Personal details', short: 'Personal' },
  { id: 'qualifications', label: 'Qualifications', short: 'Degrees' },
  { id: 'experience', label: 'Experience & skills', short: 'Experience' },
  { id: 'referees', label: 'Referees', short: 'Referees' },
  { id: 'documents', label: 'Documents', short: 'Documents' },
  { id: 'review', label: 'Review & submit', short: 'Review' },
];

export const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

export const DEGREE_TYPES = [
  { value: 'phd', label: 'PhD (Doctorate)' },
  { value: 'masters', label: "Master's degree" },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'pgd', label: 'Postgraduate Diploma (PGD)' },
  { value: 'pgde', label: 'Postgraduate Diploma in Education (PGDE)' },
  { value: 'hnd', label: 'Higher National Diploma (HND)' },
  { value: 'ond', label: 'Ordinary National Diploma (OND)' },
];

export const degreeLabel = (value) => DEGREE_TYPES.find((d) => d.value === value)?.label ?? value;

/** Suggestions only — degree class is free text. */
export const DEGREE_CLASSES = [
  'First Class',
  'Second Class Upper',
  'Second Class Lower',
  'Third Class',
  'Pass',
  'Distinction',
  'Upper Credit',
  'Lower Credit',
  'Merit',
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
];

export const EXPERIENCE_FIELDS = [
  { key: 'teachingYears', label: 'Teaching experience', unit: 'years' },
  { key: 'researchYears', label: 'Research experience', unit: 'years' },
  { key: 'industryYears', label: 'Industry experience', unit: 'years' },
  { key: 'postQualificationExperience', label: 'Post-qualification experience', unit: 'years' },
  { key: 'publications', label: 'Publications', unit: 'items' },
];

export const DOCUMENTS = [
  {
    key: 'coverLetter',
    label: 'Cover letter',
    required: true,
    hint: 'Tell us why you are a good fit for this role.',
  },
  {
    key: 'resume',
    label: 'Curriculum vitae (CV / résumé)',
    required: true,
    hint: 'Your full, up-to-date CV.',
  },
  {
    key: 'supportingDocument',
    label: 'Supporting document',
    required: false,
    hint: 'Optional — e.g. certificates or a list of publications combined into one file.',
  },
];

export const REFEREE_COUNT = 3;

const PERSONAL_KEYS = [
  'firstName',
  'middleName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'stateOfOrigin',
  'lga',
  'department',
];
const DEGREE_KEYS = ['degreeType', 'degreeClass', 'institution', 'yearAwarded', 'programme', 'department'];

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const newDegree = () => ({
  uid: uid(),
  degreeType: '',
  degreeClass: '',
  institution: '',
  yearAwarded: '',
  programme: '',
  department: '',
});

export const emptyFiles = () => ({ coverLetter: null, resume: null, supportingDocument: null });

export const emptyForm = (vacancy) => ({
  personal: {
    ...Object.fromEntries(PERSONAL_KEYS.map((k) => [k, ''])),
    department: vacancy?.department ?? '',
  },
  degrees: [newDegree()],
  experience: Object.fromEntries(EXPERIENCE_FIELDS.map((f) => [f.key, '0'])),
  professional: { ictProficiency: '', computerSkills: [], certifications: [] },
  referees: Array.from({ length: REFEREE_COUNT }, () => ({ name: '', email: '' })),
});

/* ── Path helpers: 'personal.firstName', 'degrees.0.institution' ── */
export const getIn = (obj, path) =>
  path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

const setPath = (obj, [key, ...rest], value) => {
  const next = rest.length ? setPath(obj?.[key], rest, value) : value;
  if (Array.isArray(obj)) return obj.map((item, i) => (i === Number(key) ? next : item));
  return { ...obj, [key]: next };
};

export const setIn = (obj, path, value) => setPath(obj, path.split('.'), value);

/* ── Validation ── */
const trim = (v) => String(v ?? '').trim();
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const YEAR_RE = /^\d{4}$/;
const INT_RE = /^\d+$/;

const ageOn = (dob, now) => {
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

const validatePersonal = (p) => {
  const e = {};
  if (!trim(p.firstName)) e['personal.firstName'] = 'Enter your first name.';
  if (!trim(p.lastName)) e['personal.lastName'] = 'Enter your last name.';
  if (!trim(p.email)) e['personal.email'] = 'Enter your email address.';
  else if (!isEmail(p.email)) e['personal.email'] = 'Enter a valid email address.';
  const phoneDigits = trim(p.phone).replace(/\D/g, '');
  if (!trim(p.phone)) e['personal.phone'] = 'Enter your phone number.';
  else if (!PHONE_RE.test(trim(p.phone)) || phoneDigits.length < 7 || phoneDigits.length > 15)
    e['personal.phone'] = 'Enter a valid phone number, e.g. 08031234567.';

  if (!p.dateOfBirth) e['personal.dateOfBirth'] = 'Enter your date of birth.';
  else {
    const dob = new Date(`${p.dateOfBirth}T00:00:00`);
    const now = new Date();
    if (Number.isNaN(dob.getTime())) e['personal.dateOfBirth'] = 'Enter a valid date.';
    else if (dob > now) e['personal.dateOfBirth'] = 'Date of birth cannot be in the future.';
    else if (ageOn(dob, now) < 18) e['personal.dateOfBirth'] = 'You must be at least 18 years old to apply.';
    else if (ageOn(dob, now) > 100) e['personal.dateOfBirth'] = 'Please check the year of birth.';
  }

  if (!['male', 'female'].includes(p.gender)) e['personal.gender'] = 'Select your gender.';
  if (!['single', 'married'].includes(p.maritalStatus)) e['personal.maritalStatus'] = 'Select your marital status.';
  if (!STATE_OPTIONS.some((s) => s.value === p.stateOfOrigin))
    e['personal.stateOfOrigin'] = 'Select your state of origin.';
  if (!p.lga) e['personal.lga'] = 'Select your local government area.';
  else if (p.stateOfOrigin && !lgasFor(p.stateOfOrigin).includes(p.lga))
    e['personal.lga'] = 'Select an LGA in the chosen state.';
  return e;
};

const validateDegrees = (degrees) => {
  const e = {};
  if (!degrees.length) e.degrees = 'Add at least one degree or qualification.';
  const thisYear = new Date().getFullYear();
  degrees.forEach((d, i) => {
    if (!DEGREE_TYPES.some((t) => t.value === d.degreeType))
      e[`degrees.${i}.degreeType`] = 'Select the type of qualification.';
    if (!trim(d.institution)) e[`degrees.${i}.institution`] = 'Enter the awarding institution.';
    const y = trim(d.yearAwarded);
    if (!y) e[`degrees.${i}.yearAwarded`] = 'Enter the year awarded.';
    else if (!YEAR_RE.test(y)) e[`degrees.${i}.yearAwarded`] = 'Use a 4-digit year, e.g. 2016.';
    else if (Number(y) > thisYear) e[`degrees.${i}.yearAwarded`] = 'The year cannot be in the future.';
    else if (Number(y) < 1940) e[`degrees.${i}.yearAwarded`] = 'Please check the year.';
  });
  return e;
};

const validateExperience = (exp, professional) => {
  const e = {};
  EXPERIENCE_FIELDS.forEach(({ key }) => {
    const v = trim(exp[key]);
    if (!INT_RE.test(v)) e[`experience.${key}`] = 'Enter a whole number (0 or more).';
    else if (Number(v) > 80) e[`experience.${key}`] = 'Please check this number.';
  });
  if (!['yes', 'no'].includes(professional.ictProficiency))
    e['professional.ictProficiency'] = 'Tell us whether you are ICT proficient.';
  return e;
};

const validateReferees = (referees, applicantEmail) => {
  const e = {};
  const seen = new Map();
  const own = trim(applicantEmail).toLowerCase();
  referees.forEach((r, i) => {
    if (!trim(r.name)) e[`referees.${i}.name`] = "Enter the referee's full name.";
    const email = trim(r.email).toLowerCase();
    if (!email) e[`referees.${i}.email`] = "Enter the referee's email address.";
    else if (!isEmail(email)) e[`referees.${i}.email`] = 'Enter a valid email address.';
    else if (own && email === own) e[`referees.${i}.email`] = "A referee's email can't be your own.";
    else if (seen.has(email))
      e[`referees.${i}.email`] = `This email is already used for referee ${seen.get(email) + 1}.`;
    if (email && !seen.has(email)) seen.set(email, i);
  });
  return e;
};

const validateDocuments = (files) => {
  const e = {};
  DOCUMENTS.forEach(({ key, label, required }) => {
    const f = files[key];
    if (!f && required) e[`files.${key}`] = `Upload your ${label.toLowerCase().replace(/ \(.*\)$/, '')}.`;
    const problem = validateDoc(f);
    if (problem) e[`files.${key}`] = problem;
  });
  return e;
};

/** Errors for one step, keyed by field path. */
export const validateStep = (stepId, form, files, { declaration } = {}) => {
  switch (stepId) {
    case 'personal':
      return validatePersonal(form.personal);
    case 'qualifications':
      return validateDegrees(form.degrees);
    case 'experience':
      return validateExperience(form.experience, form.professional);
    case 'referees':
      return validateReferees(form.referees, form.personal.email);
    case 'documents':
      return validateDocuments(files);
    case 'review':
      return declaration ? {} : { declaration: 'Please confirm the declaration before submitting.' };
    default:
      return {};
  }
};

/* ── Draft (everything except files) ── */
const DRAFT_VERSION = 1;
const draftKey = (jobId) => `uisto.applyDraft.${jobId}`;

const pickStrings = (src, keys) =>
  Object.fromEntries(
    keys.filter((k) => typeof src?.[k] === 'string' || typeof src?.[k] === 'number').map((k) => [k, String(src[k])]),
  );

const stringList = (v) =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 50) : [];

/** Rebuild a form from stored data, ignoring anything malformed. */
const mergeDraft = (base, d) => ({
  personal: { ...base.personal, ...pickStrings(d?.personal, PERSONAL_KEYS) },
  degrees:
    Array.isArray(d?.degrees) && d.degrees.length
      ? d.degrees.slice(0, 10).map((x) => ({ ...newDegree(), ...pickStrings(x, DEGREE_KEYS) }))
      : base.degrees,
  experience: {
    ...base.experience,
    ...pickStrings(d?.experience, EXPERIENCE_FIELDS.map((f) => f.key)),
  },
  professional: {
    ictProficiency: ['yes', 'no'].includes(d?.professional?.ictProficiency) ? d.professional.ictProficiency : '',
    computerSkills: stringList(d?.professional?.computerSkills),
    certifications: stringList(d?.professional?.certifications),
  },
  referees: base.referees.map((r, i) => ({ ...r, ...pickStrings(d?.referees?.[i], ['name', 'email']) })),
});

export const loadDraft = (jobId, vacancy) => {
  const stored = readStorage(draftKey(jobId));
  if (!stored || stored.v !== DRAFT_VERSION || typeof stored.form !== 'object') return null;
  return {
    form: mergeDraft(emptyForm(vacancy), stored.form),
    step: Number.isInteger(stored.step) ? stored.step : 0,
    savedAt: stored.savedAt,
  };
};

export const saveDraft = (jobId, form, step) =>
  writeStorage(draftKey(jobId), { v: DRAFT_VERSION, form, step, savedAt: new Date().toISOString() });

export const clearDraft = (jobId) => removeStorage(draftKey(jobId));

/* ── Payload ── */
const omitEmpty = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export const buildPayload = (jobId, form, files) => {
  const p = form.personal;
  return {
    jobId,
    department: trim(p.department) || undefined,
    personalInfo: omitEmpty({
      firstName: trim(p.firstName),
      middleName: trim(p.middleName),
      lastName: trim(p.lastName),
      email: trim(p.email),
      phone: trim(p.phone),
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      maritalStatus: p.maritalStatus,
      stateOfOrigin: p.stateOfOrigin,
      lga: p.lga,
    }),
    qualifications: {
      degrees: form.degrees.map((d) =>
        omitEmpty({
          degreeType: d.degreeType,
          degreeClass: trim(d.degreeClass),
          institution: trim(d.institution),
          yearAwarded: Number(trim(d.yearAwarded)),
          programme: trim(d.programme),
          department: trim(d.department),
        }),
      ),
    },
    experience: Object.fromEntries(
      EXPERIENCE_FIELDS.map(({ key }) => [key, parseInt(trim(form.experience[key]), 10) || 0]),
    ),
    professionalInfo: {
      ictProficiency: form.professional.ictProficiency === 'yes',
      computerSkills: form.professional.computerSkills,
      certifications: form.professional.certifications,
    },
    referees: form.referees.map((r) => ({ name: trim(r.name), email: trim(r.email) })),
    files,
  };
};

/* ── NIN pre-fill ── */
const toIsoDate = (value) => {
  const s = trim(value);
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
};

/** Map a verify-nin response to personal-detail fields (only the ones it actually has). */
export const ninToPersonal = (data, titleCase) => {
  const out = {};
  ['firstName', 'middleName', 'lastName'].forEach((k) => {
    if (trim(data?.[k])) out[k] = titleCase(data[k]);
  });
  const g = trim(data?.gender).toLowerCase();
  if (g === 'male' || g === 'm') out.gender = 'male';
  if (g === 'female' || g === 'f') out.gender = 'female';
  const dob = toIsoDate(data?.dateOfBirth);
  if (dob) out.dateOfBirth = dob;
  if (trim(data?.phone)) out.phone = trim(data.phone);
  return out;
};
