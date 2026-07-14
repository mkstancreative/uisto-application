import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Eye, Pencil } from "lucide-react";
import { formatDate } from "../../../utils/helpers";
import Toggler from "../../ui/Toggler/Toggler";

function JobTable({
    data = [],
    loading = false,
    onView,
    onEdit,
    onToggleJobStatus,
    changingId,
    meta,
    onPageChange,
    onLimitChange,
}) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => {
                const start = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
                return start + i + 1;
            },
        },
        {
            header: "Position",
            render: (row) => (
                <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 240 }}>
                    {row.position?.title ?? "—"}
                </div>
            ),
        },
        {
            header: "Cadre",
            render: (row) => row.position?.cadre ?? "—",
        },
        {
            header: "School / Dept",
            render: (row) => {
                const fac = row.position?.faculty;
                const dept = row.position?.department;
                if (!fac && !dept) return "—";
                return (
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                        {[fac, dept].filter(Boolean).join(" / ")}
                    </span>
                );
            },
        },
        {
            header: "Deadline",
            render: (row) =>
                row.applicationDeadline
                    ? formatDate(row.applicationDeadline)
                    : "—",
        },
        {
            header: "Status",
            render: (row) => (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatusBadge status={row.isOpen ? "Open" : "Closed"} />
                </div>
            ),
        },
        {
            header: "Job Status",
            render: (row) => (
                <Toggler
                    checked={row.isOpen}
                 onChange={(checked) =>
    onToggleJobStatus?.(row, checked)
}
                    disabled={changingId === row._id}
                />
            ),
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "View",
                            icon: <Eye size={13} />,
                            onClick: () => onView?.(row),
                        },
                        {
                            label: "Edit",
                            icon: <Pencil size={13} />,
                            onClick: () => onEdit?.(row),
                        },
                    ]}
                />
            ),
        },
    ];

    return <GeneralTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
    />;
}

export default JobTable;