import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Pencil } from "lucide-react";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

function LectureHallTable({
  data = [],
  loading = false,
  onEdit,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Building", accessor: "building" },
    { header: "Floor", accessor: "floor" },
    { header: "Status", 
      accessor: "status",
      render: (row) => (
        <StatusBadge status={row.status} />
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
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
export default LectureHallTable;
