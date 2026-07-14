import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Pencil, Eye } from "lucide-react";
import Toggler from "../../ui/Toggler/Toggler";

function AdminTable({ data = [], loading = false, onEdit, onToggleStatus, onViewLogs, isChangingStatus }) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => i + 1,
        },
        {
            header: "Name",
            render: (row) =>
                [row.surname, row.lastname].filter(Boolean).join(" ") ||
                [row.fname, row.lname].filter(Boolean).join(" ") || "—",
        },
        {
            header: "Email",
            render: (row) => row.user?.username ?? row.user?.email ?? "—",
        },
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Role / Profile",
            render: (row) => row.profile ?? "—",
        },
        {
            header: "Status",
            render: (row) => (
                <Toggler
                    checked={(row.user?.userstatus ?? row.status) === "Enabled"}
                    onChange={(e) => onToggleStatus?.(row, e.target.checked)}
                    disabled={isChangingStatus}
                />
            ),
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
                            label: "View Logs",
                            icon: <Eye size={13} />,
                            onClick: () => onViewLogs?.(row),
                        },
                    ]}
                />
            ),
        },
    ];

    return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default AdminTable;