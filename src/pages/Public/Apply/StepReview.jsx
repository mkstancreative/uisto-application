import React from 'react';
import { Pencil } from 'lucide-react';
import { degreeLabel, DOCUMENTS, EXPERIENCE_FIELDS, STEP_INDEX } from './applyForm';
import { StepIntro } from './FormBits';
import { formatBytes, formatDay } from '../shared/utils';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

function Section({ title, step, onEdit, children }) {
  return (
    <section className="ap-review-section">
      <header>
        <h3>{title}</h3>
        <button type="button" className="lp-link-btn" onClick={() => onEdit(STEP_INDEX[step])}>
          <Pencil size={13} /> Edit
        </button>
      </header>
      {children}
    </section>
  );
}

function Rows({ rows }) {
  return (
    <dl className="ap-review-rows">
      {rows
        .filter(([, v]) => v !== undefined)
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value === '' || value === null ? <span className="ap-none">Not provided</span> : value}</dd>
          </div>
        ))}
    </dl>
  );
}

function TagList({ items }) {
  if (!items?.length) return <span className="ap-none">None listed</span>;
  return (
    <span className="ap-review-tags">
      {items.map((t) => (
        <span key={t} className="ap-tag static">
          {t}
        </span>
      ))}
    </span>
  );
}

function StepReview({ form, files, onEdit, declaration, onDeclaration, error, disabled }) {
  const p = form.personal;
  const fullName = [p.firstName, p.middleName, p.lastName].map((s) => s.trim()).filter(Boolean).join(' ');

  return (
    <>
      <StepIntro title="Review & submit">
        Check everything carefully. You can only submit one application per recruitment cycle.
      </StepIntro>

      <div className="ap-review">
        <Section title="Personal details" step="personal" onEdit={onEdit}>
          <Rows
            rows={[
              ['Full name', fullName],
              ['Email', p.email.trim()],
              ['Phone', p.phone.trim()],
              ['Date of birth', p.dateOfBirth ? formatDay(`${p.dateOfBirth}T12:00:00`) : ''],
              ['Gender', cap(p.gender)],
              ['Marital status', cap(p.maritalStatus)],
              ['State of origin', p.stateOfOrigin],
              ['LGA', p.lga],
              ['Department', p.department.trim()],
            ]}
          />
        </Section>

        <Section title="Qualifications" step="qualifications" onEdit={onEdit}>
          <ul className="ap-review-degrees">
            {form.degrees.map((d, i) => (
              <li key={d.uid ?? i}>
                <strong>
                  {degreeLabel(d.degreeType) || 'Qualification'}
                  {d.programme.trim() && ` — ${d.programme.trim()}`}
                </strong>
                <span>
                  {[d.institution.trim(), d.yearAwarded, d.degreeClass.trim(), d.department.trim()]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Experience & skills" step="experience" onEdit={onEdit}>
          <Rows
            rows={[
              ...EXPERIENCE_FIELDS.map((f) => [
                f.label,
                `${Number(form.experience[f.key]) || 0}${f.unit === 'years' ? ' yr(s)' : ''}`,
              ]),
              ['ICT proficient', cap(form.professional.ictProficiency)],
              ['Computer skills', <TagList items={form.professional.computerSkills} />],
              ['Certifications', <TagList items={form.professional.certifications} />],
            ]}
          />
        </Section>

        <Section title="Referees" step="referees" onEdit={onEdit}>
          <ol className="ap-review-referees">
            {form.referees.map((r, i) => (
              <li key={i}>
                <strong>{r.name.trim() || <span className="ap-none">Name missing</span>}</strong>
                <span>{r.email.trim() || <span className="ap-none">Email missing</span>}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Documents" step="documents" onEdit={onEdit}>
          <Rows
            rows={DOCUMENTS.map((d) => [
              d.label,
              files[d.key] ? (
                `${files[d.key].name} (${formatBytes(files[d.key].size)})`
              ) : d.required ? (
                <span className="ap-missing">Missing — required</span>
              ) : (
                ''
              ),
            ])}
          />
        </Section>
      </div>

      <label className={`ap-declaration${error ? ' invalid' : ''}`}>
        <input
          type="checkbox"
          checked={declaration}
          onChange={(e) => onDeclaration(e.target.checked)}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
        />
        <span>
          I declare that the information I have provided is true and complete to the best of my
          knowledge. I understand that false or misleading information may lead to my application
          being rejected or any appointment being terminated.
        </span>
      </label>
      {error && (
        <span className="pub-field-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export default StepReview;
