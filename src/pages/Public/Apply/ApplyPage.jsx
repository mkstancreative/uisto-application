import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarClock, Clock, Loader2, ShieldCheck } from 'lucide-react';
import PublicLayout from '../../../components/public/PublicLayout';
import { useVacancy } from '../../../hooks/useCareers';
import VacancyUnavailable from '../Careers/VacancyUnavailable';
import { deadlineStatus, formatDeadline, vacancyUnit } from '../shared/utils';
import ApplyWizard from './ApplyWizard';
import '../Careers/careers.css';
import './apply.css';

function VacancyStrip({ job, jobId }) {
  const deadline = deadlineStatus(job.applicationDeadline);
  const unit = vacancyUnit(job);
  return (
    <div className="ap-vacancy">
      <div className="ap-vacancy-main">
        <span className="ap-vacancy-eyebrow">You are applying for</span>
        <strong>{job.title}</strong>
        <span className="ap-vacancy-meta">
          {job.cadre && <span className="cr-chip">{job.cadre}</span>}
          {unit && (
            <span>
              <Building2 size={14} /> {unit}
            </span>
          )}
          <span>
            <CalendarClock size={14} /> Closes {formatDeadline(job.applicationDeadline)}
          </span>
        </span>
      </div>
      <div className="ap-vacancy-side">
        <span className={`cr-deadline cr-deadline--${deadline.tone}`}>
          <Clock size={13} /> {deadline.label}
        </span>
        <Link to={`/careers/${jobId}`} className="ap-vacancy-link">
          View vacancy
        </Link>
      </div>
    </div>
  );
}

function ApplyPage() {
  const { jobId } = useParams();
  const { data, isLoading, isError, error, refetch } = useVacancy(jobId);
  const job = data?.data;
  /* The server answers 404 once a vacancy closes; a past deadline is enforced on submit. */
  const closed = job?.isOpen === false;
  const unavailable = !isLoading && (!job || closed);

  let content;
  if (isLoading) {
    content = (
      <div className="ap-loading" role="status">
        <Loader2 size={26} className="lp-spin" />
        <span>Loading application form…</span>
      </div>
    );
  } else if (unavailable) {
    content = (
      <div className="ap-unavailable">
        <VacancyUnavailable error={isError && !closed ? error : { status: 404 }} onRetry={() => refetch()} />
      </div>
    );
  } else {
    content = (
      <>
        <VacancyStrip job={job} jobId={jobId} />
        <ApplyWizard key={jobId} jobId={jobId} vacancy={job} />
        <p className="ap-privacy">
          <ShieldCheck size={14} /> Your information is used only to process your application.
        </p>
      </>
    );
  }

  return (
    <PublicLayout
      eyebrow="Online application"
      title={job && !closed ? `Apply: ${job.title}` : 'Apply for a vacancy'}
      subtitle={
        job && !closed
          ? 'Complete each step below. Your progress is saved on this device as you go.'
          : undefined
      }
    >
      <section className="ap-page">
        <div className="lp-container ap-container">
          {unavailable && (
            <Link to="/careers" className="cr-back">
              <ArrowLeft size={16} /> All vacancies
            </Link>
          )}
          {content}
        </div>
      </section>
    </PublicLayout>
  );
}

export default ApplyPage;
