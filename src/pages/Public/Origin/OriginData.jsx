import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Link2Off,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Save,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../../components/public/PublicLayout';
import { useOriginData, useSubmitOriginData } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import { lgasFor, STATE_OPTIONS } from '../../../utils/nigeria';
import StateCard from '../shared/StateCard';
import { matchOption } from '../shared/utils';
import './origin.css';

const STATE_VALUES = STATE_OPTIONS.map((s) => s.value);
const STATE_KEYS = STATE_OPTIONS.map((s) => s.key);

/** Map a stored state ("Akwa Ibom" / "AkwaIbom") onto a select option value. */
const toStateOption = (value) => {
  const byValue = matchOption(value, STATE_VALUES);
  if (byValue) return byValue;
  const key = matchOption(value, STATE_KEYS);
  return key ? STATE_OPTIONS.find((s) => s.key === key).value : '';
};

function Recorded({ applicationId, stateOfOrigin, lga }) {
  return (
    <dl className="og-recorded">
      {applicationId && (
        <div>
          <dt>Application ID</dt>
          <dd className="og-mono">{applicationId}</dd>
        </div>
      )}
      <div>
        <dt>State of origin</dt>
        <dd>{stateOfOrigin || '—'}</dd>
      </div>
      <div>
        <dt>Local government area</dt>
        <dd>{lga || '—'}</dd>
      </div>
    </dl>
  );
}

function OriginForm({ token, info, onSaved, onCancel }) {
  const [state, setState] = useState(() => toStateOption(info.stateOfOrigin));
  const [lga, setLga] = useState(() => matchOption(info.lga, lgasFor(toStateOption(info.stateOfOrigin))));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const save = useSubmitOriginData();
  const lgaOptions = state ? lgasFor(state) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!state) errs.state = 'Select your state of origin.';
    if (!lga) errs.lga = 'Select your local government area.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;

    save.mutate(
      { token, stateOfOrigin: state, lga },
      {
        onSuccess: (res) => {
          toast.success('Your State of Origin and LGA have been recorded.');
          onSaved({
            message: res?.message,
            applicationId: res?.data?.applicationId ?? info.applicationId,
            stateOfOrigin: res?.data?.stateOfOrigin ?? state,
            lga: res?.data?.lga ?? lga,
          });
        },
        onError: (err) => {
          const msg =
            err?.status === 400
              ? 'Invalid State of Origin or LGA. Please choose an LGA that belongs to the selected state.'
              : errorMessage(err, 'We could not save your details. Please try again.');
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <form className="og-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="lp-form-alert" role="alert">
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      <div className="og-grid">
        <div className={`lp-field${errors.state ? ' invalid' : ''}`}>
          <label className="pub-label" htmlFor="og-state">
            State of origin <span className="pub-req">*</span>
          </label>
          <div className="lp-input-wrap plain">
            <select
              id="og-state"
              value={state}
              disabled={save.isPending}
              aria-invalid={errors.state ? 'true' : undefined}
              onChange={(e) => {
                setState(e.target.value);
                setLga('');
                setErrors({});
              }}
            >
              <option value="">Select state</option>
              {STATE_OPTIONS.map((s) => (
                <option key={s.key} value={s.value}>
                  {s.value}
                </option>
              ))}
            </select>
          </div>
          {errors.state && <span className="pub-field-error">{errors.state}</span>}
        </div>

        <div className={`lp-field${errors.lga ? ' invalid' : ''}`}>
          <label className="pub-label" htmlFor="og-lga">
            Local government area <span className="pub-req">*</span>
          </label>
          <div className="lp-input-wrap plain">
            <select
              id="og-lga"
              value={lga}
              disabled={!state || save.isPending}
              aria-invalid={errors.lga ? 'true' : undefined}
              onChange={(e) => {
                setLga(e.target.value);
                setErrors((x) => ({ ...x, lga: undefined }));
              }}
            >
              <option value="">{state ? 'Select LGA' : 'Select a state first'}</option>
              {lgaOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {errors.lga && <span className="pub-field-error">{errors.lga}</span>}
        </div>
      </div>

      <div className="og-actions">
        {onCancel && (
          <button type="button" className="pub-btn-ghost" onClick={onCancel} disabled={save.isPending}>
            Cancel
          </button>
        )}
        <button type="submit" className="lp-btn lp-btn-lime lg" disabled={save.isPending}>
          {save.isPending ? (
            <>
              <Loader2 size={16} className="lp-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={16} /> Save details
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function OriginData() {
  const { token } = useParams();
  const { data, isLoading, isError, error, refetch } = useOriginData(token);
  const info = data?.data;
  const [saved, setSaved] = useState(null);
  const [editing, setEditing] = useState(false);

  let content;
  if (isLoading) {
    content = (
      <div className="og-loading" role="status">
        <Loader2 size={26} className="lp-spin" />
        <span>Loading your details…</span>
      </div>
    );
  } else if (isError || !info) {
    const clientError = !isError || (error?.status >= 400 && error?.status < 500);
    content = clientError ? (
      <StateCard icon={Link2Off} tone="danger" title="This link is invalid or has expired">
        <p>
          Links to update your State of Origin and LGA are valid for 30 days. Please use the most
          recent email you received, or contact the university&apos;s recruitment office for a new
          link.
        </p>
      </StateCard>
    ) : (
      <StateCard
        icon={TriangleAlert}
        tone="danger"
        title="We couldn't load your details"
        actions={
          <button type="button" className="lp-btn lp-btn-teal" onClick={() => refetch()}>
            <RefreshCw size={16} /> Try again
          </button>
        }
      >
        <p>{errorMessage(error, 'Please check your connection and try again.')}</p>
      </StateCard>
    );
  } else if (saved && !editing) {
    content = (
      <div className="og-card pub-panel og-done">
        <span className="og-done-icon">
          <CheckCircle2 size={30} />
        </span>
        <h2>Details recorded</h2>
        <p>{saved.message || 'Thank you. Your State of Origin and LGA have been recorded.'}</p>
        <Recorded {...saved} />
        <button type="button" className="lp-link-btn" onClick={() => setEditing(true)}>
          <Pencil size={13} /> Made a mistake? Update again
        </button>
      </div>
    );
  } else {
    const current = saved ?? info;
    const already = Boolean(saved || info.alreadySubmitted);
    content = (
      <div className="og-card pub-panel">
        <div className="og-intro">
          <span className="og-intro-icon">
            <MapPin size={20} />
          </span>
          <div>
            <h2>Hello{info.firstName || info.fullName ? `, ${info.firstName || info.fullName}` : ''}</h2>
            <p>
              Please confirm your State of Origin and Local Government Area for your application
              {info.jobTitle ? (
                <>
                  {' '}
                  for <strong>{info.jobTitle}</strong>
                </>
              ) : null}
              {info.university ? <> at {info.university}</> : null}.
            </p>
          </div>
        </div>

        {already && !editing ? (
          <>
            <div className="lp-form-alert success">
              <CheckCircle2 size={16} />
              <span>You have already submitted these details. You can update them if they are wrong.</span>
            </div>
            <Recorded
              applicationId={current.applicationId ?? info.applicationId}
              stateOfOrigin={current.stateOfOrigin}
              lga={current.lga}
            />
            <div className="og-actions">
              <button type="button" className="lp-btn lp-btn-teal" onClick={() => setEditing(true)}>
                <Pencil size={15} /> Update
              </button>
            </div>
          </>
        ) : (
          <>
            {info.applicationId && (
              <p className="og-appid">
                Application ID: <span className="og-mono">{info.applicationId}</span>
              </p>
            )}
            <OriginForm
              key={`${current.stateOfOrigin ?? ''}|${current.lga ?? ''}`}
              token={token}
              info={{ ...info, stateOfOrigin: current.stateOfOrigin, lga: current.lga }}
              onCancel={already ? () => setEditing(false) : null}
              onSaved={(values) => {
                setSaved(values);
                setEditing(false);
              }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <PublicLayout
      eyebrow="Applicant details"
      title="State of Origin & LGA"
      subtitle="Confirm where you are from so we can complete your application record."
    >
      <section className="og-page">
        <div className="lp-container og-container">{content}</div>
      </section>
    </PublicLayout>
  );
}

export default OriginData;
