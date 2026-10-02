import React, { useState } from 'react';
import { AlertCircle, BadgeCheck, Calendar, Fingerprint, Loader2, Mail, Phone, User } from 'lucide-react';
import { useVerifyNin } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import { lgasFor, STATE_OPTIONS } from '../../../utils/nigeria';
import { GENDERS, MARITAL_STATUSES } from './applyForm';
import { ChoiceGroup, SelectField, StepIntro, TextField } from './FormBits';

const NIN_RE = /^\d{11}$/;
const STATE_SELECT = STATE_OPTIONS.map((s) => ({ value: s.value, label: s.value }));

/**
 * The NIN lookup fronts a paid third-party API: it only ever runs when the
 * applicant presses the button — never automatically, debounced or retried.
 */
function NinLookup({ onPrefill }) {
  const [nin, setNin] = useState('');
  const [result, setResult] = useState(null); // { ok, message }
  const verify = useVerifyNin();

  const valid = NIN_RE.test(nin);

  const lookUp = () => {
    if (!valid || verify.isPending) return;
    setResult(null);
    verify.mutate(nin, {
      onSuccess: (res) => {
        const filled = onPrefill(res?.data ?? {});
        setResult({
          ok: true,
          message: `${res?.message ?? 'NIN verified.'}${
            filled ? ' We have filled in the details we found — please check them.' : ''
          }`,
        });
      },
      onError: (err) => setResult({ ok: false, message: errorMessage(err, 'We could not verify that NIN.') }),
    });
  };

  return (
    <div className="ap-nin">
      <div className="ap-nin-head">
        <span className="ap-nin-icon">
          <Fingerprint size={20} />
        </span>
        <div>
          <strong>Save time with your NIN</strong>
          <p>Optional. Enter your 11-digit National Identification Number to pre-fill your details.</p>
        </div>
      </div>
      <div className="ap-nin-row">
        <div className="lp-input-wrap plain">
          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            placeholder="11-digit NIN"
            aria-label="National Identification Number"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                lookUp();
              }
            }}
          />
        </div>
        <button type="button" className="lp-btn lp-btn-teal" onClick={lookUp} disabled={!valid || verify.isPending}>
          {verify.isPending ? (
            <>
              <Loader2 size={16} className="lp-spin" /> Looking up…
            </>
          ) : (
            'Look up NIN'
          )}
        </button>
      </div>
      {nin && !valid && <span className="pub-field-hint">{11 - nin.length} more digit(s) needed.</span>}
      {result && (
        <div className={`lp-form-alert${result.ok ? ' success' : ''}`} role="status">
          {result.ok ? <BadgeCheck size={16} /> : <AlertCircle size={16} />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}

function StepPersonal({ bind, form, setField, onNinPrefill }) {
  const state = form.personal.stateOfOrigin;
  const lgaOptions = state ? lgasFor(state) : [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <StepIntro title="Personal details">
        Tell us who you are. Fields marked * are required.
      </StepIntro>

      <NinLookup onPrefill={onNinPrefill} />

      <div className="ap-grid">
        <TextField label="First name" required icon={User} autoComplete="given-name" {...bind('personal.firstName')} />
        <TextField label="Middle name" optional autoComplete="additional-name" {...bind('personal.middleName')} />
        <TextField label="Last name" required autoComplete="family-name" {...bind('personal.lastName')} />
        <TextField
          label="Email address"
          required
          type="email"
          icon={Mail}
          autoComplete="email"
          hint="We'll use this to contact you — you'll also need it to track your application."
          {...bind('personal.email')}
        />
        <TextField
          label="Phone number"
          required
          type="tel"
          icon={Phone}
          autoComplete="tel"
          placeholder="08031234567"
          {...bind('personal.phone')}
        />
        <TextField
          label="Date of birth"
          required
          type="date"
          icon={Calendar}
          max={today}
          {...bind('personal.dateOfBirth')}
        />
        <ChoiceGroup label="Gender" required options={GENDERS} {...bind('personal.gender')} />
        <ChoiceGroup label="Marital status" required options={MARITAL_STATUSES} {...bind('personal.maritalStatus')} />
        <SelectField
          label="State of origin"
          required
          options={STATE_SELECT}
          placeholder="Select state"
          {...bind('personal.stateOfOrigin')}
          onChange={(v) => {
            setField('personal.stateOfOrigin', v);
            setField('personal.lga', '');
          }}
        />
        <SelectField
          label="Local government area"
          required
          options={lgaOptions}
          placeholder={state ? 'Select LGA' : 'Select a state first'}
          disabled={!state}
          {...bind('personal.lga')}
        />
        <TextField
          label="Department"
          optional
          className="span-2"
          hint="The department you are applying to, if applicable."
          {...bind('personal.department')}
        />
      </div>
    </>
  );
}

export default StepPersonal;
