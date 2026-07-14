import React from 'react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import { Pencil } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';

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
        <div>
          <div style={{ fontWeight: 600 }}>{row.fullName}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-color-light)' }}>
            {row.personalInfo?.email}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-color-light)' }}>
            {row.personalInfo?.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Job Applied For',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-color-light)' }}>
            {row.jobId?.position?.title || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Applied At',
      render: (row) => formatDate(row.appliedAt),
    },
    {
      header: 'AI Status',
      render: (row) => {
        const status = row.aiScore?.shortlistStatus || 'Pending';
        let color = 'gray';
        if (status === 'Auto-Shortlisted') color = 'green';
        if (status === 'Rejected') color = 'red';
        if (status === 'Manual Review') color = 'orange';

        return <span style={{ color, fontWeight: 500 }}>{status}</span>;
      },
    },
    {
      header: 'Status',
      render: (row) => {
        const s = row.status || 'Submitted';
        let badgeClass = 'badge-gray';
        if (s === 'Shortlisted' || s === 'Offered') badgeClass = 'badge-green';
        if (s === 'Under Review' || s === 'Interviewed')
          badgeClass = 'badge-orange';
        if (s === 'Submitted') badgeClass = 'badge-blue';

        return <span className={`badge ${badgeClass}`}>{s}</span>;
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'View Application',
              icon: <Pencil size={13} />,
              onClick: () => onView?.(row),
            },
            {
              label: 'Update Status',
              icon: <Pencil size={13} />,
              onClick: () => onUpdateStatus?.(row),
            },
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
