import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../../utils/helpers";

function NotificationTable({ data = [], loading = false, onView, onEdit, onDelete }) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => i + 1,
        },
        {
            header: "Title",
            render: (row) => (
                <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 260 }}>
                    {row.title ?? "—"}
                </div>
            ),
        },
        {
            header: "Message",
            render: (row) => (
                <p style={{
                    fontSize: 12,
                    color: "#64748b",
                    maxWidth: 380,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    margin: 0,
                }}>
                    {row.message ?? "—"}
                </p>
            ),
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            header: "Date",
            render: (row) => formatDate(row.created_at ?? row.datecreated ?? ""),
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

    return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default NotificationTable;