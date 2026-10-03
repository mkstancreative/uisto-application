import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  Hash,
  Loader2,
  Mail,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../../components/public/PublicLayout';
import { useApplicationStatus, useVacancy } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import RichText from '../shared/RichText';
import { formatDay, isEmail } from '../shared/utils';
import './track.css';

const PIPELINE = ['Submitted', 'Under Review', 'Shortlisted', 'Interviewed', 'Offered'];
const TERMINAL = ['Not Shortlisted', 'Rejected'];
const ID_RE = /^UISTO-[A-Z0-9]+-\d{2}$/;

const STATUS_COPY = {
  Submitted: 'We have received your application. It will be reviewed after the closing date.',
  'Under Review': 'Your application is being reviewed by the recruitment team.',
  Shortlisted: 'Congratulations — you have been shortlisted. We will contact you about the next stage.',
  Interviewed: 'Your interview is complete. The panel is finalising its decision.',
  Offered: 'Congratulations! An offer has been made. Please check your email for details.',
  'Not Shortlisted':
    'Thank you for your interest. On this occasion your application was not shortlisted.',
  Rejected: 'Thank you for your interest. On this occasion your application was not successful.',
};

const errorCopy = (err) => {
  switch (err?.status) {
    case 403:
      return {
        icon: ShieldAlert,
        title: "That email doesn't match this application",
        text: 'Enter the exact email address you used when you applied.',
      };
    case 404:
      return {
        icon: AlertCircle,
        title: 'Application not found',
        text: 'We could not find an application with that ID. Check it carefully — it looks like UISTO-XXXXXX-26.',
      };
    case 400:
      return {
        icon: AlertCircle,
        title: 'Please check your details',
        text: errorMessage(err, 'The application ID or email address is not valid.'),
      };
    default:
      return {
        icon: AlertCircle,
        title: "We couldn't check your application",
        text: errorMessage(err, 'Please try again in a moment.'),
      };
  }
};

function Pipeline({ status }) {
  const terminal = TERMINAL.includes(status);
  const reached = terminal ? 1 : Math.max(0, PIPELINE.indexOf(status));
  const steps = terminal ? [...PIPELINE.slice(0, 2), status] : PIPELINE;

  return (
    <ol className={`tr-pipeline${terminal ? ' is-terminal' : ''}`} aria-label="Application progress">
      {steps.map((label, i) => {
        const isTerminal = terminal && i === steps.length - 1;
        const state = isTerminal ? 'terminal' : i < reached ? 'done' : i === reached ? 'current' : 'todo';
        return (
          <li key={label} className={`tr-stage tr-stage--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="tr-stage-dot">
              {state === 'done' && <Check size={14} />}
              {state === 'current' && <span className="tr-pulse" />}
              {state === 'terminal' && <Ban size={14} />}
            </span>
            <span className="tr-stage-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function JobTitle({ jobId }) {
  /* The status response only carries the job id; the title is available while the vacancy is open. */
  const { data } = useVacancy(jobId);
  const title = data?.data?.title;
  if (!title) return null;
  return (
    <Link to={`/careers/${jobId}`} className="tr-job-title">
      {title} <ArrowRight size={14} />
    </Link>
  );
}

function Result({ data }) {
  const status = data?.status ?? 'Submitted';
  const terminal = TERMINAL.includes(status);
  const job = data?.job ?? {};
  const jobId = job.id ?? job._id;

  return (
    <div className="tr-result pub-panel">
      <div className="tr-result-head">
        <div>
          <span className="tr-label">Application ID</span>
          <code className="tr-id">{data?.applicationId}</code>
        </div>
        <span className={`tr-status${terminal ? ' is-terminal' : status === 'Offered' ? ' is-offered' : ''}`}>
          {status}
        </span>
      </div>

      {!PIPELINE.includes(status) && !terminal ? (
        <p className="tr-status-text">Current status: {status}</p>
      ) : (
        <Pipeline status={status} />
      )}

      {STATUS_COPY[status] && <p className="tr-status-text">{STATUS_COPY[status]}</p>}

      <dl className="tr-facts">
        <div>
          <dt>
            <CalendarDays size={14} /> Applied on
          </dt>
          <dd>{formatDay(data?.appliedAt)}</dd>
        </div>
        {jobId && (
          <div>
            <dt>Vacancy</dt>
            <dd>
              <JobTitle jobId={jobId} />
            </dd>
          </div>
        )}
      </dl>

      {job.description && (
        <div className="tr-job">
          <h3>Job description</h3>
          <RichText text={job.description} />
        </div>
      )}
    </div>
  );
}

function TrackApplication() {
  const [params] = useSearchParams();
  const [applicationId, setApplicationId] = useState(() => (params.get('applicationId') ?? '').toUpperCase());
  const [email, setEmail] = useState(() => params.get('email') ?? '');
  const [fieldErrors, setFieldErrors] = useState({});
  /* Links from the success screen carry both values — look them up straight away */
  const [submitted, setSubmitted] = useState(() => {
    const id = params.get('applicationId');
    const mail = params.get('email');
    return id && mail && isEmail(mail)
      ? { applicationId: id.trim().toUpperCase(), email: mail.trim() }
      : null;
  });
  const lookup = useApplicationStatus(submitted);
  const isChecking = lookup.isFetching;

  const run = (id, mail) => {
    const next = { applicationId: id.trim().toUpperCase(), email: mail.trim() };
    if (submitted?.applicationId === next.applicationId && submitted?.email === next.email) {
      lookup.refetch();
    } else {
      setSubmitted(next);
    }
  };

  useEffect(() => {
    if (lookup.error?.status >= 500 || lookup.error?.status === 0) toast.error(errorMessage(lookup.error));
  }, [lookup.error]);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const id = applicationId.trim().toUpperCase();
    if (!id) errs.applicationId = 'Enter your application ID.';
    else if (!ID_RE.test(id)) errs.applicationId = 'Application IDs look like UISTO-KQP7X2-26.';
    if (!email.trim()) errs.email = 'Enter the email address you applied with.';
    else if (!isEmail(email)) errs.email = 'Enter a valid email address.';
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    run(id, email);
  };

  const err = lookup.isError && !isChecking ? errorCopy(lookup.error) : null;
  const result = lookup.isSuccess && !isChecking ? lookup.data?.data : null;

  return (
    <PublicLayout
      eyebrow="Track application"
      title="Check your application status"
      subtitle="Enter the application ID you received when you applied, with the same email address."
    >
      <section className="tr-page">
        <div className="lp-container tr-container">
          <form className="tr-form" onSubmit={submit} noValidate>
            <div className={`lp-field${fieldErrors.applicationId ? ' invalid' : ''}`}>
              <label className="pub-label" htmlFor="tr-id">
                Application ID
              </label>
              <div className="lp-input-wrap">
                <Hash size={16} className="lp-input-icon" />
                <input
                  id="tr-id"
                  className="tr-id-input"
                  placeholder="UISTO-XXXXXX-26"
                  autoComplete="off"
                  spellCheck={false}
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  aria-invalid={fieldErrors.applicationId ? 'true' : undefined}
                />
              </div>
              {fieldErrors.applicationId && <span className="pub-field-error">{fieldErrors.applicationId}</span>}
            </div>

            <div className={`lp-field${fieldErrors.email ? ' invalid' : ''}`}>
              <label className="pub-label" htmlFor="tr-email">
                Email address
              </label>
              <div className="lp-input-wrap">
                <Mail size={16} className="lp-input-icon" />
                <input
                  id="tr-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                />
              </div>
              {fieldErrors.email && <span className="pub-field-error">{fieldErrors.email}</span>}
            </div>

            <button type="submit" className="lp-btn lp-btn-lime lg tr-submit" disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 size={16} className="lp-spin" /> Checking…
                </>
              ) : (
                <>
                  <Search size={16} /> Check status
                </>
              )}
            </button>
          </form>

          {err && (
            <div className="tr-error" role="alert">
              <err.icon size={20} />
              <div>
                <strong>{err.title}</strong>
                <p>{err.text}</p>
              </div>
            </div>
          )}

          {result && <Result data={result} />}

          {!result && !err && !isChecking && (
            <p className="tr-help">
              Lost your application ID? It was shown when you submitted your application. If you no
              longer have it, please contact the university&apos;s recruitment office.
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

export default TrackApplication;
