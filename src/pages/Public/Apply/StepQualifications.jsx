import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { DEGREE_CLASSES, DEGREE_TYPES } from './applyForm';
import { SelectField, StepIntro, TextField } from './FormBits';

const MAX_DEGREES = 10;

function StepQualifications({ form, bind, errors, onAddDegree, onRemoveDegree }) {
  const thisYear = new Date().getFullYear();

  return (
    <>
      <StepIntro title="Qualifications">
        List your degrees and diplomas, starting with the highest. At least one is required.
      </StepIntro>

      {errors.degrees && (
        <div className="lp-form-alert" role="alert">
          {errors.degrees}
        </div>
      )}

      <datalist id="ap-degree-classes">
        {DEGREE_CLASSES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="ap-repeat-list">
        {form.degrees.map((d, i) => (
          <fieldset key={d.uid} className="ap-repeat">
            <legend className="ap-repeat-head">
              <span className="ap-repeat-badge">
                <GraduationCap size={16} />
              </span>
              Qualification {i + 1}
            </legend>
            {form.degrees.length > 1 && (
              <button
                type="button"
                className="ap-remove"
                onClick={() => onRemoveDegree(i)}
                aria-label={`Remove qualification ${i + 1}`}
              >
                <Trash2 size={15} /> Remove
              </button>
            )}

            <div className="ap-grid">
              <SelectField
                label="Qualification type"
                required
                options={DEGREE_TYPES}
                placeholder="Select type"
                {...bind(`degrees.${i}.degreeType`)}
              />
              <TextField
                label="Class / grade"
                optional
                list="ap-degree-classes"
                placeholder="e.g. Second Class Upper"
                {...bind(`degrees.${i}.degreeClass`)}
              />
              <TextField
                label="Institution"
                required
                className="span-2"
                placeholder="e.g. University of Nigeria, Nsukka"
                {...bind(`degrees.${i}.institution`)}
              />
              <TextField
                label="Year awarded"
                required
                inputMode="numeric"
                maxLength={4}
                placeholder={String(thisYear - 5)}
                {...bind(`degrees.${i}.yearAwarded`)}
                onChange={(v) => bind(`degrees.${i}.yearAwarded`).onChange(v.replace(/\D/g, '').slice(0, 4))}
              />
              <TextField
                label="Programme / course"
                optional
                placeholder="e.g. Computer Science"
                {...bind(`degrees.${i}.programme`)}
              />
              <TextField
                label="Department"
                optional
                className="span-2"
                {...bind(`degrees.${i}.department`)}
              />
            </div>
          </fieldset>
        ))}
      </div>

      {form.degrees.length < MAX_DEGREES && (
        <button type="button" className="ap-add" onClick={onAddDegree}>
          <Plus size={16} /> Add another qualification
        </button>
      )}
    </>
  );
}

export default StepQualifications;
