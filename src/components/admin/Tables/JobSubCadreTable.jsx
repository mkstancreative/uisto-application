import React from 'react'
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { Pencil, Power, Trash2 } from 'lucide-react';

function JobSubCadreTable({ data, loading, onEdit, onDelete, onToggleStatus, meta, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "S/N",
            render: (_, index) => {
                const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
                return <span>{start + index + 1}</span>;
            },
        },
        {
            header: "Cadre Name",
            render: (row) => <span className="fw-500">{row.name}</span>,
        },
        {
            header: "Parent Cadre",
            render: (row) => row.cadre || "—",
        },
        {
            header: "Description",
            render: (row) => row.description || "—",
        },
        {
            header: "Status",
            render: (row) => (
             <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
            ),
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "Edit Cadre",
                            icon: <Pencil size={13} />,
                            onClick: () => onEdit?.(row),
                        },
                        {
                            label: row.isActive ? "Deactivate" : "Activate",
                            icon: <Power size={13} />,
                            onClick: () => onToggleStatus?.(row),
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

export default JobSubCadreTable