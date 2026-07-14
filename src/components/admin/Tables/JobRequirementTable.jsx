import React from 'react'
import Toggler from '../../ui/Toggler/Toggler';
import { Pencil, Trash2 } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';

function JobRequirementTable({data, loading, onToggle, onEdit, onDelete, meta, onPageChange, onLimitChange}) {
    const columns = [
    {
      header: "S/N",
      render: (_, index) => {
          const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
          return start + index + 1;
      },
    },

    {
      header: "Requirement Name",
      render: (row) => <span className="fw-500">{row.name}</span>,
    },
    {
      header: "Category",
      render: (row) => row.cadre || "—",
    },
    {
      header: "Status",
      render: (row) => (
        <Toggler 
          disabled={row.isSystem}
          checked={row.isActive}
          onChange={() => onToggle?.(row)}
        />
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit Requirement",
              icon: <Pencil size={13} />,
              onClick: () => onEdit?.(row),
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              onClick: () => onDelete?.(row),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return <GeneralTable columns={columns} data={data} loading={loading} meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />;
}

export default JobRequirementTable