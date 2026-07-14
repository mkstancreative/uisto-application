import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Pencil, Trash2, BookMarked, CheckCircle } from "lucide-react";
import { formatDate } from "../../../utils/helpers";

function LibraryTable({ data = [], loading = false, meta, onPageChange, onLimitChange, onEdit, onDelete, onLoan }) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
    },
    {
      header: "Title",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{row.title ?? "—"}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {row.author ?? ""}
          </div>
        </div>
      ),
    },
    {
      header: "ISBN",
      render: (row) => (
        <code style={{ fontSize: 12 }}>{row.isbn ?? "—"}</code>
      ),
    },
    {
      header: "Department",
      render: (row) => row.department?.name ?? "—",
    },
    // {
    //   header: "Section",
    //   render: (row) => (
    //     <span style={{ fontSize: 12, color: "#64748b" }}>{row.section ?? "—"}</span>
    //   ),
    // },
    {
      header: "Copies",
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: 13 }}>{row.copies ?? 0}</span>
      ),
    },
    {
      header: "Available",
      render: (row) => {
        const avail = Number(row.isavailable ?? 0);
        return (
          <span style={{
            fontWeight: 700,
            fontSize: 13,
            color: avail > 0 ? "#22c55e" : "#ef4444",
          }}>
            {avail}
          </span>
        );
      },
    },
 
    {
      header: "Date Added",
      render: (row) => formatDate(row.date_created ?? ""),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "Loan Out",
              icon: <BookMarked size={13} />,
              onClick: () => onLoan?.(row),
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

export default LibraryTable;