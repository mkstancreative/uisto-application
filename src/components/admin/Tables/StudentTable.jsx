import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Eye, Pencil, Trash2, KeyRound, Hash } from "lucide-react";

function StudentTable({
  data = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
  onAssignRegNumber,
  meta = null,
  onPageChange = null,
  onLimitChange = null,
  departments = [],
  levels = [],
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: "Student",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {row.fname} {row.mname ? `${row.mname} ` : ""}
              {row.lname}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {row.regno ?? row.application_no ?? ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {row.email ?? "—"}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (row) => <span style={{ fontSize: 12 }}>{row.phone ?? "—"}</span>,
    },
    {
      header: "Department",
      render: (row) => {
        const dept = departments.find(
          (d) => String(d.id) === String(row.department_id),
        );
        return (
          <span style={{ fontSize: 12 }}>
            {dept?.name ??
              (row.department_id ? `Dept. ${row.department_id}` : "—")}
          </span>
        );
      },
    },
    {
      header: "Level",
      render: (row) => {
        const level = levels.find((l) => String(l.id) === String(row.level_id));
        return level ? (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(99,102,241,0.1)",
              color: "#6366f1",
              whiteSpace: "nowrap",
            }}
          >
            {level.name}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
        );
      },
    },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={
            row.status ?? row.studentstatus ?? row.user?.userstatus ?? "—"
          }
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
            ...(onAssignRegNumber && !row.regno
              ? [
                  {
                    label: "Assign Reg. No.",
                    icon: <Hash size={13} />,
                    onClick: () => onAssignRegNumber(row),
                  },
                ]
              : []),
            ...(onResetPassword
              ? [
                  {
                    label: "Reset Password",
                    icon: <KeyRound size={13} />,
                    onClick: () => onResetPassword(row),
                  },
                ]
              : []),
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

export default StudentTable;
