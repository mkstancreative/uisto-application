import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  SearchCheck,
} from 'lucide-react';
import PublicLayout from '../../../components/public/PublicLayout';
import { useVacancy } from '../../../hooks/useCareers';
import RichText from '../shared/RichText';
import VacancyUnavailable from './VacancyUnavailable';
import { deadlineStatus, formatDay, formatDeadline, subcadreName } from '../shared/utils';
import './careers.css';

function DetailSkeleton() {
  return (
    <div className="cr-detail" aria-busy="true" aria-label="Loading vacancy">
      <div className="cr-detail-main pub-panel">
        <span className="pub-skel" style={{ width: '40%', height: 20 }} />
        <span className="pub-skel" style={{ width: '100%', height: 14, marginTop: 18 }} />
        <span className="pub-skel" style={{ width: '92%', height: 14 }} />
        <span className="pub-skel" style={{ width: '70%', height: 14 }} />
        <span className="pub-skel" style={{ width: '35%', height: 20, marginTop: 30 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="pub-skel" style={{ width: `${80 - i * 8}%`, height: 14 }} />
        ))}
      </div>
      <aside className="cr-detail-side">
        <div className="cr-summary cr-summary--skeleton">
          <span className="pub-skel dark" style={{ width: '60%', height: 18 }} />
          <span className="pub-skel dark" style={{ width: '80%', height: 14 }} />
          <span className="pub-skel dark" style={{ width: '70%', height: 14 }} />
          <span className="pub-skel dark" style={{ width: '100%', height: 46, marginTop: 12 }} />
        </div>
      </aside>
    </div>
  );
}

function VacancyDetail() {
  const { jobId } = useParams();
  const { data, isLoading, isError, error, refetch } = useVacancy(jobId);
  const job = data?.data;

  if (isLoading || !job) {
    return (
      <PublicLayout eyebrow="Vacancy" title={isLoading ? 'Loading vacancy…' : 'Vacancy'}>
        <section className="cr-page">
          <div className="lp-container cr-container">
            {isLoading ? (
              <DetailSkeleton />
            ) : (
              <VacancyUnavailable error={isError ? error : { status: 404 }} onRetry={() => refetch()} />
            )}
          </div>
        </section>
      </PublicLayout>
    );
  }

  const reqs = Array.isArray(job.requirements) ? job.requirements.filter(Boolean) : [];
  const deadline = deadlineStatus(job.applicationDeadline);
  const sub = subcadreName(job.subcadre);
  const years = Number(job.requiredYearsExperience);
  const closed = deadline.tone === 'closed' || job.isOpen === false;

  const facts = [
    job.cadre && { icon: Layers, label: 'Cadre', value: job.cadre },
    job.department && { icon: Building2, label: 'Department', value: job.department },
    sub && { icon: Layers, label: 'Sub-cadre', value: sub },
    Number.isFinite(years) && {
      icon: BriefcaseBusiness,
      label: 'Experience',
      value: years > 0 ? `${years}+ year${years === 1 ? '' : 's'}` : 'No minimum',
    },
    job.publishedDate && { icon: CalendarCheck, label: 'Published', value: formatDay(job.publishedDate) },
    { icon: CalendarClock, label: 'Deadline', value: formatDeadline(job.applicationDeadline) },
  ].filter(Boolean);

  return (
    <PublicLayout
      eyebrow={job.cadre ? `${job.cadre} vacancy` : 'Vacancy'}
      title={job.title || 'Vacancy'}
      subtitle={[job.department, sub].filter(Boolean).join(' · ') || undefined}
    >
      <section className="cr-page">
        <div className="lp-container cr-container">
          <Link to="/careers" className="cr-back">
            <ArrowLeft size={16} /> All vacancies
          </Link>

          <div className="cr-detail">
            <div className="cr-detail-main pub-panel">
              <h2 className="cr-detail-h">About the role</h2>
              <RichText
                text={job.description}
                className="cr-detail-desc"
              />
              {!job.description && <p className="lp-muted">No description has been provided for this vacancy.</p>}

              <h2 className="cr-detail-h">
                <SearchCheck size={20} /> Requirements
              </h2>
              {reqs.length > 0 ? (
                <ul className="cr-req-list">
                  {reqs.map((r, i) => (
                    <li key={i}>
                      <CheckCircle2 size={18} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="lp-muted">No specific requirements are listed.</p>
              )}

              <div className="cr-detail-howto">
                <h3>How to apply</h3>
                <p>
                  The application takes about 15 minutes. Have your CV, cover letter, degree details
                  and the names and email addresses of three referees ready. You don&apos;t need an
                  account — you&apos;ll receive an application ID to track your progress.
                </p>
              </div>
            </div>

            <aside className="cr-detail-side">
              <div className="cr-summary">
                <span className={`cr-deadline cr-deadline--${deadline.tone}`}>
                  <Clock size={13} /> {deadline.label}
                </span>
                <h3>{job.title}</h3>
                <dl className="cr-facts">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <dt>
                        <Icon size={15} /> {label}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                {closed ? (
                  <p className="cr-summary-note">Applications for this vacancy have closed.</p>
                ) : (
                  <Link to={`/careers/${jobId}/apply`} className="lp-btn lp-btn-lime lg cr-apply-btn">
                    Apply now <ArrowRight size={16} />
                  </Link>
                )}
                <Link to="/track" className="cr-summary-link">
                  Already applied? Track your application
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {!closed && (
        <div className="cr-mobile-apply">
          <Link to={`/careers/${jobId}/apply`} className="lp-btn lp-btn-lime lg">
            Apply now <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </PublicLayout>
  );
}

export default VacancyDetail;
