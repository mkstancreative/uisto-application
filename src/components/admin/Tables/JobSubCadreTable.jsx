import { Pencil, Trash2 } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import Toggler from '../../ui/Toggler/Toggler';
import { formatOnlyDate } from '../../../utils/helpers';
import '../common/adminCommon.css';

function JobSubCadreTable({
  data = [],
  loading,
  canEdit = false,
  togglingId,
  onEdit,
  onDelete,
  onToggle,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, index) => {
        const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
        return start + index + 1;
      },
    },
    {
      header: 'Subcadre',
      render: (row) => <span className="cell-main">{row.name}</span>,
    },
    {
      header: 'Cadre',
      render: (row) => row.cadre || 'Non-Academic',
    },
    {
      header: 'Active',
      render: (row) =>
        canEdit ? (
          <Toggler
            checked={Boolean(row.isActive)}
            disabled={togglingId === row._id}
            onChange={() => onToggle?.(row)}
          />
        ) : (
          <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
        ),
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="cell-nowrap">{row.createdAt ? formatOnlyDate(row.createdAt) : '—'}</span>
      ),
    },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            render: (row) => (
              <ActionDropdown
                actions={[
                  {
                    label: 'Rename',
                    icon: <Pencil size={13} />,
                    onClick: () => onEdit?.(row),
                  },
                  {
                    label: 'Delete',
                    icon: <Trash2 size={13} />,
                    onClick: () => onDelete?.(row),
                    danger: true,
                  },
                ]}
              />
            ),
          },
        ]
      : []),
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

export default JobSubCadreTable;
