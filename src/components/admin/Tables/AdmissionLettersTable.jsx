import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Pencil, Trash2 } from "lucide-react";

function AdmissionLettersTable({ data = [], loading, meta, onEdit, onDelete, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
        },
        {
            header: "Title",
            render: (row) => <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{row.title}</div>,
        },
        {
            header: "Admission Mode",
            render: (row) => (
                <span style={{ fontSize: 11, padding: "3px 8px", background: "var(--bg-muted)", color: "var(--text-muted)", borderRadius: 12, fontWeight: 500 }}>
                    {row.mode || "—"}
                </span>
            ),
        },
        {
            header: "Content Preview",
            render: (row) => {
                const snippet = row.body ? row.body.replace(/<[^>]*>?/gm, '').substring(0, 60) + "..." : "—";
                return <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{snippet}</span>;
            },
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "Edit",
                            icon: <Pencil size={13} />,
                            onClick: () => onEdit?.(row),
                        },
                        {
                            label: "Delete",
                            icon: <Trash2 size={13} />,
                            danger: true,
                            onClick: () => onDelete?.(row),
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
            emptyMessage="No admission letters found."
        />
    );
}

export default AdmissionLettersTable;