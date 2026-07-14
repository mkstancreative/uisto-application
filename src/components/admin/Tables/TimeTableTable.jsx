import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Eye, Pencil, Trash } from "lucide-react";

function TimeTableTable({
  data = [],
  loading = false,
  onView,
  onEdit,
  meta,
  onPageChange,
  onLimitChange,
  subjectMap = {},
  hallMap = {},
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    { header: "Day", accessor: "day_of_week" },
    { header: "Start Time", accessor: "start_time" },
    { header: "End Time", accessor: "end_time" },
    { header: "Subject", render: (row) => row.subject?.name ?? subjectMap[String(row.subject_id)] ?? `Subject #${row.subject_id ?? "—"}` },
    // { header: "Hall", render: (row) => row.lecturehall?.name ?? hallMap[String(row.lecturehall_id)] ?? `Hall #${row.lecturehall_id ?? "—"}` },
    { header: "Department", render: (row) => row.department?.name ?? (row.department_id ? `Dept #${row.department_id}` : "—") },
    { header: "Level", render: (row) => row.level?.name ?? (row.level_id ? `Level #${row.level_id}` : "—") },

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
export default TimeTableTable;
