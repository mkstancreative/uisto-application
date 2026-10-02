import React from 'react';
import { EXPERIENCE_FIELDS } from './applyForm';
import { ChoiceGroup, StepIntro, TagInput, TextField } from './FormBits';

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

function StepExperience({ form, bind, setField }) {
  return (
    <>
      <StepIntro title="Experience & skills">
        Enter whole numbers. Use 0 where something doesn&apos;t apply to you.
      </StepIntro>

      <h3 className="ap-subhead">Experience</h3>
      <div className="ap-grid ap-grid--3">
        {EXPERIENCE_FIELDS.map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            required
            inputMode="numeric"
            maxLength={2}
            hint={f.unit === 'years' ? 'In years' : 'Number of publications'}
            {...bind(`experience.${f.key}`)}
            onChange={(v) => setField(`experience.${f.key}`, v.replace(/\D/g, '').slice(0, 2))}
          />
        ))}
      </div>

      <h3 className="ap-subhead">Professional skills</h3>
      <div className="ap-grid">
        <ChoiceGroup
          label="Are you proficient in ICT?"
          required
          className="span-2"
          options={YES_NO}
          {...bind('professional.ictProficiency')}
        />
        <TagInput
          path="professional.computerSkills"
          label="Computer skills"
          className="span-2"
          placeholder="e.g. Python, Microsoft Excel"
          hint="Press Enter or type a comma after each skill."
          values={form.professional.computerSkills}
          onChange={(v) => setField('professional.computerSkills', v)}
        />
        <TagInput
          path="professional.certifications"
          label="Certifications"
          className="span-2"
          placeholder="e.g. Cisco CCNA"
          hint="Press Enter or type a comma after each certification."
          values={form.professional.certifications}
          onChange={(v) => setField('professional.certifications', v)}
        />
      </div>
    </>
  );
}

export default StepExperience;
