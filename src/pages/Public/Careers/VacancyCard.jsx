import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, CalendarClock, Clock } from 'lucide-react';
import { deadlineStatus, formatDeadline, vacancyUnit } from '../shared/utils';
import './careers.css';

const MAX_REQS = 3;

function VacancyCard({ job }) {
  const id = job?._id ?? job?.id;
  const reqs = Array.isArray(job?.requirements) ? job.requirements.filter(Boolean) : [];
  const shown = reqs.slice(0, MAX_REQS);
  const more = reqs.length - shown.length;
  const deadline = deadlineStatus(job?.applicationDeadline);
  const unit = vacancyUnit(job);
  const years = Number(job?.requiredYearsExperience);

  return (
    <article className="cr-card">
      <div className="cr-card-top">
        {job?.cadre && <span className="cr-chip">{job.cadre}</span>}
        <span className={`cr-deadline cr-deadline--${deadline.tone}`}>
          <Clock size={13} /> {deadline.label}
        </span>
      </div>

      <h3 className="cr-card-title">{job?.title || 'Untitled vacancy'}</h3>

      <ul className="cr-card-meta">
        {unit && (
          <li>
            <Building2 size={14} /> {unit}
          </li>
        )}
        {Number.isFinite(years) && (
          <li>
            <BriefcaseBusiness size={14} />
            {years > 0 ? `${years}+ year${years === 1 ? '' : 's'} experience` : 'No minimum experience'}
          </li>
        )}
        <li>
          <CalendarClock size={14} /> Closes {formatDeadline(job?.applicationDeadline)}
        </li>
      </ul>

      {shown.length > 0 && (
        <ul className="cr-card-reqs">
          {shown.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
          {more > 0 && <li className="cr-card-more">+{more} more</li>}
        </ul>
      )}

      <Link to={`/careers/${id}`} className="lp-btn lp-btn-lime cr-card-cta">
        View &amp; apply <ArrowRight size={15} />
      </Link>
    </article>
  );
}

export function VacancyCardSkeleton() {
  return (
    <div className="cr-card cr-card--skeleton" aria-hidden="true">
      <div className="cr-card-top">
        <span className="pub-skel" style={{ width: 90, height: 22 }} />
        <span className="pub-skel" style={{ width: 80, height: 22 }} />
      </div>
      <span className="pub-skel" style={{ width: '75%', height: 24 }} />
      <span className="pub-skel" style={{ width: '55%', height: 14 }} />
      <span className="pub-skel" style={{ width: '65%', height: 14 }} />
      <span className="pub-skel" style={{ width: '90%', height: 12, marginTop: 10 }} />
      <span className="pub-skel" style={{ width: '80%', height: 12 }} />
      <span className="pub-skel" style={{ width: 130, height: 38, marginTop: 'auto' }} />
    </div>
  );
}

export default VacancyCard;
