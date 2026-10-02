import { Eye, ClipboardEdit, MailCheck } from 'lucide-react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate, formatOnlyDate } from '../../../utils/helpers';

const REFEREE_COUNT = 3;

export function ScoreCell({ score, recommendation }) {
  if (score === null || score === undefined) {
    return <span className="rc-cell-sub">Not scored</span>;
  }
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="rc-score">
      <span className="rc-score-num">
        {score}
        <small> / 100</small>
      </span>
      <div className="rc-meter" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      {recommendation && <span className="rc-cell-sub">{recommendation}</span>}
    </div>
  );
}

function JobApplicantTable({
  data,
  loading,
  onView,
  onUpdateStatus,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: 'Applicant',
      render: (row) => (
        <div className="rc-cell-stack">
          <button type="button" className="rc-link-btn" onClick={() => onView?.(row)}>
            {row.fullName || '—'}
          </button>
          {row.email && <span className="rc-cell-sub">{row.email}</span>}
          {row.phone && <span className="rc-cell-sub">{row.phone}</span>}
          {row.applicationId && <span className="rc-cell-sub rc-mono">{row.applicationId}</span>}
        </div>
      ),
    },
    {
      header: 'State / LGA',
      render: (row) =>
        row.stateOfOrigin || row.lga ? (
          <div className="rc-cell-stack">
            <span>{row.stateOfOrigin || '—'}</span>
            {row.lga && <span className="rc-cell-sub">{row.lga}</span>}
          </div>
        ) : (
          '—'
        ),
    },
    {
      header: 'Applied',
      render: (row) => (row.appliedAt ? formatOnlyDate(row.appliedAt) : '—'),
    },
    {
      header: 'AI Score',
      render: (row) => (
        <ScoreCell
          score={row.aiScore?.overallScore}
          recommendation={row.aiScore?.recommendation ?? row.aiScore?.aiRecommendation}
        />
      ),
    },
    {
      header: 'AI Shortlist',
      render: (row) => <StatusBadge status={row.aiScore?.shortlistStatus || 'Pending'} />,
    },
    {
      header: 'References',
      render: (row) => {
        const n = Number(row.ReactedReferees ?? 0);
        const tone = n >= REFEREE_COUNT ? 'full' : n > 0 ? 'partial' : 'none';
        return (
          <span className={`rc-refs ${tone}`} title={`${n} of ${REFEREE_COUNT} references submitted`}>
            {n}/{REFEREE_COUNT}
          </span>
        );
      },
    },
    {
      header: 'Interview',
      render: (row) =>
        row.interviewDate || row.inviteSent || row.refNo ? (
          <div className="rc-cell-stack">
            {row.interviewDate ? (
              <span style={{ whiteSpace: 'nowrap' }}>{formatDate(row.interviewDate)}</span>
            ) : (
              <span className="rc-cell-sub">No date set</span>
            )}
            {row.inviteSent && (
              <span className="rc-chip">
                <MailCheck size={11} /> Invite sent
              </span>
            )}
            {row.refNo && <span className="rc-cell-sub rc-mono">{row.refNo}</span>}
          </div>
        ) : (
          <span className="rc-cell-sub">Not scheduled</span>
        ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'Submitted'} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            { label: 'View application', icon: <Eye size={13} />, onClick: () => onView?.(row) },
            ...(onUpdateStatus
              ? [
                  {
                    label: 'Update status',
                    icon: <ClipboardEdit size={13} />,
                    onClick: () => onUpdateStatus(row),
                  },
                ]
              : []),
          ]}
        />
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

export default JobApplicantTable;
