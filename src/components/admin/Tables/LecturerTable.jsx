import { Activity, Eye, Pencil } from 'lucide-react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import Toggler from '../../ui/Toggler/Toggler';

function LecturerTable({
  data = [],
  loading = false,
  onEdit,
  onView,
  onViewLogs,
  onToggleStatus,
  isChangingStatus = false,
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, i) => i + 1,
    },
    {
      header: 'Full Name',
      render: (row) =>
        [
          row.firstname ?? row.fname,
          row.middlename ?? row.mname,
          row.lastname ?? row.lname,
        ]
          .filter(Boolean)
          .join(' ') || '—',
    },
    {
      header: 'Phone',
      render: (row) => row.phone ?? '—',
    },
    {
      header: 'Department',
      render: (row) => row.department?.name ?? '—',
    },

    {
      header: 'Subjects',
      render: (row) => {
        const subs = row.subjects ?? [];
        if (!subs.length) return '—';
        return (
          <span style={{ fontSize: 12 }}>
            {subs
              .slice(0, 2)
              .map((s) => s.name ?? s)
              .join(', ')}
            {subs.length > 2 ? ` +${subs.length - 2} more` : ''}
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => (
        <Toggler
          checked={
            (
              row.user?.userstatus ??
              row.userstatus ??
              row.status ??
              ''
            ).toLowerCase() === 'enabled'
          }
          onChange={(e) => onToggleStatus?.(row, e.target.checked)}
          disabled={isChangingStatus}
        />
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'View',
              icon: <Eye size={13} />,
              onClick: () => onView?.(row),
            },
            {
              label: 'Edit',
              icon: <Pencil size={13} />,
              onClick: () => onEdit?.(row),
            },
            {
              label: 'Activity Logs',
              icon: <Activity size={13} />,
              onClick: () => onViewLogs?.(row),
            },
          ]}
        />
      ),
    },
  ];

  return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default LecturerTable;
