import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { Eye, Pencil } from 'lucide-react';

function DepartmentTable({
  data = [],
  loading = false,
  onView,
  onEdit,

  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: 'Department',
      accessor: 'name',
    },
    {
      header: 'Faculty',
      render: (row) => row.faculty?.name ?? '—',
    },
    {
      header: 'Code',
      render: (row) => row.deptcode ?? '—',
    },
    {
      header: 'Programmes',
      render: (row) =>
        row.programmes?.length
          ? row.programmes.map((p) => p.name).join(', ')
          : '—',
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

export default DepartmentTable;
