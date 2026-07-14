import { Book, Eye, Pencil } from 'lucide-react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';

function CoursesTable({
  data = [],
  loading = false,
  onEdit,

  onPageChange,
  onLimitChange,
  meta,
  onView,
  levels = [],
  semesters = [],
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: 'Course Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name ?? '—'}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {row.subjectcode ?? ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Level',
      render: (row) => {
        if (row.level?.name) {
          return (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(99,102,241,0.1)',
                color: '#6366f1',
              }}
            >
              {row.level.name}
            </span>
          );
        }
        const level = levels.find((l) => String(l.id) === String(row.level_id));
        return level ? (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
            }}
          >
            {level.name}
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      header: 'Semester',
      render: (row) => {
        if (row.semester?.name) return row.semester.name;
        const sem = semesters.find(
          (s) => String(s.id) === String(row.semester_id),
        );
        return sem?.name ?? '—';
      },
    },
    {
      header: 'Units',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: 13 }}>
          {row.creditload ?? '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={
            row.status === 1 || row.status === '1' ? 'Active' : 'Inactive'
          }
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
              label: 'Topics',
              icon: <Book size={13} />,
              href: `/admin/courses/${row.id}/topics`,
            },
            // {
            //   label: row.status === 1 || row.status === "1" ? "Disable" : "Enable",
            //   icon: <EyeOff size={13} />,
            //   onClick: () => onDisable?.(row),
            // },
            // {
            //   label: "Delete",
            //   icon: <Trash2 size={13} />,
            //   danger: true,
            //   onClick: () => onDelete?.(row),
            // },
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
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      meta={meta}
    />
  );
}

export default CoursesTable;
