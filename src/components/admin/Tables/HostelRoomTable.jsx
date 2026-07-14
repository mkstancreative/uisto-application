import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { Pencil, UserPlus } from "lucide-react";

function HostelRoomTable({
  data = [],
  loading = false,
  onEdit,
  onAssign,
  onViewStudents
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, index) => index + 1,
    },
    {
      header: "Hostel Name",
      render: (row) => row.hostel?.name ?? "—",
    },
    {
      header: "Floor",
      render: (row) => row.floor ?? "—",
    },
    {
      header: "Room No.",
      render: (row) => row.room_number ?? "—",
    },
    {
      header: "Available Beds",
      render: (row) => row.available_beds ?? "—",
    },
    {
      header: "Occupied Beds",
      render: (row) => row.occupiedbeds ?? "—",
    },
    {
      header: "Free Beds",
      render: (row) =>
        row.available_beds != null && row.occupiedbeds != null
          ? row.available_beds - row.occupiedbeds
          : "—",
    },
    {
      header: "Description",
      render: (row) => row.description ?? "—",
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View Students",
              icon: <UserPlus size={13} />,
              onClick: () => onViewStudents?.(row),
            },
            {
              label: "Assign Student",
              icon: <UserPlus size={13} />,
              onClick: () => onAssign?.(row),
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

  return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default HostelRoomTable;
