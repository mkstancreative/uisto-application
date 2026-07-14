import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import { Mail } from "lucide-react";

function StudentWithoutEmailTable({
  data = [],
  loading = false,
  onAssignEmail,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: "Name",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.fname} {row.lname}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{row.email ?? "No email"}</div>
        </div>
      ),
    },
    {
      header: "Faculty",
      render: (row) => row.faculty?.name ?? "—",
    },
    {
      header: "Department",
      render: (row) => row.department?.name ?? "—",
    },

    {
      header: "Assign Email",
      render: (row) => (
        <button
          className="assign-email-btn"
          onClick={() => onAssignEmail?.(row)}
        >
          <Mail size={13} />
          Assign Email
        </button>
      ),
    },
  ];

  return <GeneralTable
    columns={columns}
    data={data}
    loading={loading}
    onPageChange={onPageChange}
    onLimitChange={onLimitChange}
    meta={meta} />;
}

export default StudentWithoutEmailTable;
