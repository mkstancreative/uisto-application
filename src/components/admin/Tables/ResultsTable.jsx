import { Pencil, Trash2 } from 'lucide-react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';

function ResultsTable({
  data = [],
  loading,
  meta,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}) {
  const gradeColor = (grade) => {
    const g = grade?.toUpperCase();
    if (g === 'A') return { background: '#dcfce7', color: '#16a34a' };
    if (g === 'B') return { background: '#dbeafe', color: '#1d4ed8' };
    if (g === 'C') return { background: '#fef9c3', color: '#a16207' };
    if (g === 'D') return { background: '#ffedd5', color: '#c2410c' };
    return { background: '#f1f5f9', color: '#64748b' };
  };

  const columns = [
    {
      header: 'S/N',
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
    },
    {
      header: 'Reg No',
      render: (row) => (
        <code
          style={{
            fontSize: 11,
            background: 'rgba(0,0,0,0.04)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {row.regno}
        </code>
      ),
    },
    {
      header: 'Student',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {row.student?.fname} {row.student?.lname}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {row.department?.name}
          </div>
        </div>
      ),
    },
    {
      header: 'Subject',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {row.subject?.name}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {row.subject?.subjectcode}
          </div>
        </div>
      ),
    },
    {
      header: 'Level',
      render: (row) => row.level?.name ?? '—',
    },
    {
      header: 'Session / Semester',
      render: (row) => (
        <div style={{ fontSize: 12 }}>
          <div>{row.session?.name}</div>
          <div style={{ color: '#64748b' }}>{row.semester?.name}</div>
        </div>
      ),
    },
    {
      header: 'CA / Exam / Total',
      render: (row) => (
        <div style={{ fontSize: 12, fontFamily: 'monospace' }}>
          <span title="CA">{row.ca}</span>
          {' / '}
          <span title="Exam Score">{row.score}</span>
          {' / '}
          <strong title="Total">{row.total}</strong>
        </div>
      ),
    },
    {
      header: 'Grade',
      render: (row) => {
        const style = gradeColor(row.grade);
        return (
          <span
            style={{
              ...style,
              padding: '2px 10px',
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 12,
              display: 'inline-block',
            }}
          >
            {row.grade ?? '—'}
          </span>
        );
      },
    },
    // {
    //     header: "Uploaded",
    //     render: (row) => <span style={{ fontSize: 12 }}>{formatDate(row.uploaddate)}</span>,
    // },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
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
  ];

  return (
    <GeneralTable
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyMessage="No results found."
    />
  );
}

export default ResultsTable;
