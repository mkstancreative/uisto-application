import { Eye } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatOnlyDate } from '../../../utils/helpers';
import { ScoreCell } from './JobApplicantTable';
import { candidateName } from './shortlistFormat';

/** Ranked candidates from GET /shortlist/:jobId/candidates. */
function ShortlistedCandidatesTable({ data = [], loading, meta, onPageChange, onLimitChange, onView }) {
  const offset = meta ? (meta.page - 1) * meta.limit : 0;

  const columns = [
    {
      header: '#',
      render: (_, i) => <span className="rc-score-num">{offset + i + 1}</span>,
    },
    {
      header: 'Candidate',
      render: (row) => (
        <div className="rc-cell-stack">
          <button type="button" className="rc-link-btn" onClick={() => onView?.(row)}>
            {candidateName(row)}
          </button>
          {row.applicationId && <span className="rc-cell-sub rc-mono">{row.applicationId}</span>}
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="rc-cell-stack">
          <span className="rc-cell-sub">{row.personalInfo?.email ?? row.email ?? '—'}</span>
          {(row.personalInfo?.phone ?? row.phone) && (
            <span className="rc-cell-sub">{row.personalInfo?.phone ?? row.phone}</span>
          )}
        </div>
      ),
    },
    {
      header: 'AI Score',
      render: (row) => <ScoreCell score={row.aiScore?.overallScore} />,
    },
    {
      header: 'Recommendation',
      render: (row) => {
        const rec = row.aiScore?.aiRecommendation ?? row.aiScore?.recommendation;
        return rec ? <StatusBadge status={rec} /> : '—';
      },
    },
    {
      header: 'AI Shortlist',
      render: (row) => <StatusBadge status={row.aiScore?.shortlistStatus || 'Pending'} />,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'Submitted'} />,
    },
    {
      header: 'Applied',
      render: (row) => (row.appliedAt ? formatOnlyDate(row.appliedAt) : '—'),
    },
    {
      header: '',
      render: (row) => (
        <button type="button" className="rc-btn rc-btn-sm" onClick={() => onView?.(row)}>
          <Eye size={13} /> View
        </button>
      ),
    },
  ];

  return (
    <GeneralTable
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}

export default ShortlistedCandidatesTable;
