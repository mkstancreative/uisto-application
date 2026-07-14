import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Eye, Pencil } from "lucide-react";
import { formatNaira } from "../../../utils/helpers";

function FeesTable({ data = [], loading = false, onEdit, meta, onPageChange, onLimitChange, onView }) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: "Fee Name",
      accessor: "name",
    },
    {
      header: "Amount (₦)",
      render: (row) => formatNaira(row.amount) ?? "—",
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            { label: "View", icon: <Eye size={13} />, onClick: () => onView?.(row) },
            { label: "Edit", icon: <Pencil size={13} />, onClick: () => onEdit?.(row) },
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

export default FeesTable;
