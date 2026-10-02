import { KeyRound, Pencil, Power, Trash2 } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate, formatOnlyDate } from '../../../utils/helpers';
import { getInitials } from '../../../utils/roles';
import RoleTag from '../common/RoleTag';
import '../common/adminCommon.css';

/** Staff accounts. `currentUserId` disables self-destructive actions on your own row. */
function StaffTable({
  data = [],
  loading,
  currentUserId,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: 'User',
      render: (row) => {
        const self = String(row.id ?? row._id) === String(currentUserId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
            <span
              aria-hidden
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                background: 'rgba(var(--accent-rgb), 0.14)',
                color: 'var(--accent-ink)',
              }}
            >
              {getInitials(row.name)}
            </span>
            <div style={{ minWidth: 0 }}>
              <span className="cell-main">
                {row.name || 'Unnamed'}
                {self && (
                  <span className="tag tag-slate" style={{ marginLeft: 6 }}>
                    You
                  </span>
                )}
              </span>
              <span className="cell-sub" style={{ overflowWrap: 'anywhere' }}>
                {row.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Role',
      render: (row) => <RoleTag role={row.role} />,
    },
    {
      header: 'Department',
      render: (row) => row.department || <span className="cell-muted">—</span>,
    },
    {
      header: 'Status',
      render: (row) => (
        <div className="cell-stack">
          <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
          {row.mustChangePassword && (
            <span className="tag tag-amber" title="Has not yet replaced the temporary password">
              Awaiting first sign-in
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Last login',
      render: (row) => (
        <span className="cell-nowrap">
          {row.lastLogin ? formatDate(row.lastLogin) : <span className="cell-muted">Never</span>}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="cell-nowrap">{row.createdAt ? formatOnlyDate(row.createdAt) : '—'}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => {
        const self = String(row.id ?? row._id) === String(currentUserId);
        return (
          <ActionDropdown
            actions={[
              {
                label: 'Edit',
                icon: <Pencil size={13} />,
                onClick: () => onEdit?.(row),
              },
              {
                label: self ? 'Reset password (use My account)' : 'Reset password',
                icon: <KeyRound size={13} />,
                onClick: () => onResetPassword?.(row),
                disabled: self,
              },
              {
                label: row.isActive ? 'Deactivate' : 'Activate',
                icon: <Power size={13} />,
                onClick: () => onToggleActive?.(row),
                disabled: self,
              },
              {
                label: 'Delete',
                icon: <Trash2 size={13} />,
                onClick: () => onDelete?.(row),
                danger: true,
                disabled: self,
              },
            ]}
          />
        );
      },
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

export default StaffTable;
