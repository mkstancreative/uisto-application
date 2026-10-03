import { formatDate, formatDeadline, formatOnlyDate } from '../../../utils/helpers';

/* CSV rows for applications, built only from fields the API documents. */

const DEGREE_LABELS = {
  phd: 'PhD',
  masters: 'Masters',
  bachelors: 'Bachelors',
  hnd: 'HND',
  ond: 'OND',
  pgd: 'PGD',
};

export const degreeLabel = (type) => {
  if (!type) return '';
  const key = String(type).toLowerCase();
  return DEGREE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
};

const yesNo = (v) => (v === true ? 'Yes' : v === false ? 'No' : '');
const date = (v) => (v ? formatOnlyDate(v) : '');
const dateTime = (v) => (v ? formatDate(v) : '');

export const degreesSummary = (degrees = []) =>
  (degrees ?? [])
    .map((d) => {
      const extras = [d.degreeClass, d.yearAwarded].filter(Boolean).join(', ');
      return [degreeLabel(d.degreeType), d.programme, d.institution && `- ${d.institution}`, extras && `(${extras})`]
        .filter(Boolean)
        .join(' ');
    })
    .join('; ');

/** Fields present on every row of GET /admin/applications. */
export const flattenApplication = (ap = {}) => {
  const ai = ap.aiScore ?? {};
  const exp = ap.experience ?? {};
  return {
    'Application ID': ap.applicationId ?? '',
    'Full Name': ap.fullName ?? '',
    Email: ap.email ?? ap.personalInfo?.email ?? '',
    Phone: ap.phone ?? ap.personalInfo?.phone ?? '',
    'State of Origin': ap.stateOfOrigin ?? ap.personalInfo?.stateOfOrigin ?? '',
    LGA: ap.lga ?? ap.personalInfo?.lga ?? '',
    'Ref No': ap.refNo ?? '',
    Status: ap.status ?? '',
    'Applied At': dateTime(ap.appliedAt),
    'Interview Date': dateTime(ap.interviewDate),
    'Invite Sent': yesNo(ap.inviteSent),
    'AI Overall Score': ai.overallScore ?? '',
    'AI Qualification Score': ai.qualificationScore ?? '',
    'AI Experience Score': ai.experienceScore ?? '',
    'AI Publication Score': ai.publicationScore ?? '',
    'AI Professional Score': ai.professionalScore ?? '',
    'AI Recommendation': ai.recommendation ?? ai.aiRecommendation ?? '',
    'AI Shortlist Status': ai.shortlistStatus ?? '',
    'Missing Requirements': (ai.missingRequirements ?? []).join('; '),
    'Teaching Years': exp.teachingYears ?? '',
    'Research Years': exp.researchYears ?? '',
    'Industry Years': exp.industryYears ?? '',
    Publications: exp.publications ?? '',
    'Post-Qualification Experience (yrs)': exp.postQualificationExperience ?? '',
    Degrees: degreesSummary(ap.qualifications?.degrees),
    'References Submitted': ap.ReactedReferees ?? '',
  };
};

/** Everything in GET /admin/applications/:id, for the single-record export. */
export const flattenApplicationDetail = (ap = {}) => {
  const pi = ap.personalInfo ?? {};
  const pro = ap.professionalInfo ?? {};
  const job = ap.job ?? {};
  const pos = job.position ?? {};
  const base = flattenApplication(ap);
  return {
    'Application ID': base['Application ID'],
    'Full Name': base['Full Name'],
    'First Name': pi.firstName ?? '',
    'Middle Name': pi.middleName ?? '',
    'Last Name': pi.lastName ?? '',
    Email: base.Email,
    Phone: base.Phone,
    'Date of Birth': date(pi.dateOfBirth),
    Gender: pi.gender ?? '',
    'Marital Status': pi.maritalStatus ?? '',
    'State of Origin': base['State of Origin'],
    LGA: base.LGA,
    Vacancy: pos.title ?? '',
    Cadre: pos.cadre ?? '',
    Department: pos.department ?? ap.department ?? '',
    'Vacancy Deadline': job.applicationDeadline ? formatDeadline(job.applicationDeadline) : '',
    ...Object.fromEntries(
      Object.entries(base).filter(
        ([k]) => !['Application ID', 'Full Name', 'Email', 'Phone', 'State of Origin', 'LGA'].includes(k),
      ),
    ),
    'ICT Proficient': yesNo(pro.ictProficiency),
    'Computer Skills': (pro.computerSkills ?? []).join('; '),
    Certifications: (pro.certifications ?? []).join('; '),
    Referees: (ap.referees ?? [])
      .map((r) => `${r.name ?? ''} <${r.email ?? ''}> [${r.hasSubmitted ? 'Submitted' : 'Pending'}]`)
      .join('; '),
    'Admin Notes': ap.adminNotes ?? '',
  };
};
