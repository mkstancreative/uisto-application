import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarX2, RefreshCw, TriangleAlert } from 'lucide-react';
import StateCard from '../shared/StateCard';
import { errorMessage } from '../../../api/api';

/** Shared by the vacancy detail and apply pages: 404 → closed, anything else → retry. */
function VacancyUnavailable({ error, onRetry }) {
  if (error?.status === 404) {
    return (
      <StateCard
        icon={CalendarX2}
        tone="warning"
        title="This vacancy is no longer open"
        actions={
          <Link to="/careers" className="lp-btn lp-btn-teal">
            <ArrowLeft size={16} /> Browse open vacancies
          </Link>
        }
      >
        <p>
          The application window may have closed, or the link you followed is incorrect. Take a
          look at the roles that are currently open.
        </p>
      </StateCard>
    );
  }

  return (
    <StateCard
      icon={TriangleAlert}
      tone="danger"
      title="We couldn't load this vacancy"
      actions={
        <>
          <button type="button" className="lp-btn lp-btn-teal" onClick={onRetry}>
            <RefreshCw size={16} /> Try again
          </button>
          <Link to="/careers" className="pub-btn-ghost">
            Back to vacancies
          </Link>
        </>
      }
    >
      <p>{errorMessage(error, 'Please check your connection and try again.')}</p>
    </StateCard>
  );
}

export default VacancyUnavailable;
