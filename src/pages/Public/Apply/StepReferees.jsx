import React from 'react';
import { Mail, MailCheck, User } from 'lucide-react';
import { StepIntro, TextField } from './FormBits';

function StepReferees({ form, bind }) {
  return (
    <>
      <StepIntro title="Referees">
        Provide exactly three referees who know your work, each with a different email address.
      </StepIntro>

      <div className="lp-form-alert info">
        <MailCheck size={16} />
        <span>
          When you submit, each referee will be emailed a secure link to submit their reference
          directly. Please let them know to expect it, and double-check their email addresses.
        </span>
      </div>

      <div className="ap-repeat-list">
        {form.referees.map((_, i) => (
          <fieldset key={i} className="ap-repeat">
            <legend className="ap-repeat-head">
              <span className="ap-repeat-badge">{i + 1}</span>
              Referee {i + 1}
            </legend>
            <div className="ap-grid">
              <TextField
                label="Full name"
                required
                icon={User}
                placeholder="e.g. Prof. Adaobi Nwosu"
                {...bind(`referees.${i}.name`)}
              />
              <TextField
                label="Email address"
                required
                type="email"
                icon={Mail}
                placeholder="name@institution.edu.ng"
                {...bind(`referees.${i}.email`)}
              />
            </div>
          </fieldset>
        ))}
      </div>
    </>
  );
}

export default StepReferees;
