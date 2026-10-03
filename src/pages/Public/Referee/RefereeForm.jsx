import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, HeartHandshake, Link2Off, Loader2, RefreshCw, Send, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../../components/public/PublicLayout';
import { useRefereeForm, useSubmitReference } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import StateCard from '../shared/StateCard';
import FileField from '../shared/FileField';
import './referee.css';

const MAX_CHARS = 10000;

const pronouns = (gender) => {
  const g = String(gender ?? '').toLowerCase();
  if (g === 'male') return { obj: 'him', poss: 'his' };
  if (g === 'female') return { obj: 'her', poss: 'her' };
  return { obj: 'them', poss: 'their' };
};

function ThankYou({ name }) {
  return (
    <StateCard
      icon={HeartHandshake}
      tone="success"
      title="Thank you — your reference has been received"
      actions={
        <Link to="/" className="lp-btn lp-btn-teal">
          Go to the homepage
        </Link>
      }
    >
      <p>
        {name ? `Thank you, ${name}. ` : ''}Your reference is now part of the application and will be
        considered by the recruitment panel. There is nothing more you need to do.
      </p>
    </StateCard>
  );
}

function ReferenceForm({ token, ctx, onDone }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const submit = useSubmitReference();
  const p = pronouns(ctx.applicantGender);
  const firstName = String(ctx.applicantName ?? '').split(' ')[0] || 'the applicant';

  const trimmed = text.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!trimmed && !file) {
      setFormError('Please type your reference or upload a reference letter.');
      return;
    }
    submit.mutate(
      { token, referenceText: trimmed, referenceFile: file },
      {
        onSuccess: (res) => {
          toast.success(res?.message ?? 'Reference submitted successfully');
          onDone();
        },
        onError: (err) => {
          const msg = errorMessage(err, 'We could not submit your reference. Please try again.');
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <form className="rf-card pub-panel" onSubmit={handleSubmit} noValidate>
      <div className="rf-intro">
        <h2>Dear {ctx.refereeName || 'Referee'},</h2>
        <p>
          <strong>{ctx.applicantName || 'An applicant'}</strong> has applied for the position of{' '}
          <strong>{ctx.jobTitle || 'a vacancy'}</strong>
          {ctx.university ? (
            <>
              {' '}
              at <strong>{ctx.university}</strong>
            </>
          ) : null}{' '}
          and has named you as a referee. We would be grateful for your honest assessment of{' '}
          {p.poss} suitability for the role.
        </p>
        <p className="rf-muted">
          You may wish to comment on how long and in what capacity you have known {p.obj}, and on{' '}
          {p.poss} character, abilities and experience.
        </p>
      </div>

      {formError && (
        <div className="lp-form-alert" role="alert">
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      <div className="lp-field">
        <label className="pub-label" htmlFor="rf-text">
          Your reference
        </label>
        <div className="lp-input-wrap plain">
          <textarea
            id="rf-text"
            rows={10}
            maxLength={MAX_CHARS}
            placeholder={`I have known ${firstName} for…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submit.isPending}
          />
        </div>
        <span className={`rf-count${text.length > MAX_CHARS * 0.9 ? ' warn' : ''}`}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>

      <div className="rf-or">
        <span>and / or</span>
      </div>

      <FileField
        label="Upload a reference letter"
        optional
        file={file}
        error={fileError}
        onChange={setFile}
        onError={setFileError}
        disabled={submit.isPending}
      />

      <p className="rf-muted rf-note">
        Provide a typed reference, an uploaded letter, or both. Once submitted, your reference cannot
        be changed.
      </p>

      <button type="submit" className="lp-btn lp-btn-lime lg rf-submit" disabled={submit.isPending}>
        {submit.isPending ? (
          <>
            <Loader2 size={16} className="lp-spin" /> Submitting…
          </>
        ) : (
          <>
            <Send size={16} /> Submit reference
          </>
        )}
      </button>
    </form>
  );
}

function RefereeForm() {
  const { token } = useParams();
  const { data, isLoading, isError, error, refetch } = useRefereeForm(token);
  const [done, setDone] = useState(false);

  /* This endpoint returns a bare object; tolerate an envelope just in case. */
  const ctx = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;

  let content;
  if (isLoading) {
    content = (
      <div className="rf-loading" role="status">
        <Loader2 size={26} className="lp-spin" />
        <span>Loading reference form…</span>
      </div>
    );
  } else if (isError || !ctx) {
    const clientError = error?.status >= 400 && error?.status < 500;
    content = clientError ? (
      <StateCard icon={Link2Off} tone="danger" title="This reference link is invalid or has expired">
        <p>
          Please check that you opened the full link from the email. If the problem continues, contact
          the applicant or the university&apos;s recruitment office.
        </p>
      </StateCard>
    ) : (
      <StateCard
        icon={TriangleAlert}
        tone="danger"
        title="We couldn't load the reference form"
        actions={
          <button type="button" className="lp-btn lp-btn-teal" onClick={() => refetch()}>
            <RefreshCw size={16} /> Try again
          </button>
        }
      >
        <p>{errorMessage(error, 'Please check your connection and try again.')}</p>
      </StateCard>
    );
  } else if (done || ctx.hasSubmitted) {
    content = <ThankYou name={ctx.refereeName} />;
  } else {
    content = <ReferenceForm token={token} ctx={ctx} onDone={() => setDone(true)} />;
  }

  return (
    <PublicLayout
      eyebrow="Referee"
      title="Submit a reference"
      subtitle={ctx?.applicantName && !isError ? `For ${ctx.applicantName}${ctx.jobTitle ? ` — ${ctx.jobTitle}` : ''}` : undefined}
    >
      <section className="rf-page">
        <div className="lp-container rf-container">{content}</div>
      </section>
    </PublicLayout>
  );
}

export default RefereeForm;
