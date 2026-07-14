import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import { Pencil } from "lucide-react";

function AcademicTable({ data = [], mode, loading = false, onEdit, label = "Name" }) {
  const columns = [
    {
      header: "S/N",
      render: (_, index) => index + 1,
    },
    {
      header: label,
      accessor: "name",
    },

    ...(!mode
      ? [
        {
          header: "Action",
          render: (row) => (
            <button
              className="assign-email-btn"
              onClick={() => onEdit?.(row)}
            >
              <Pencil size={13} />
              Edit
            </button>
          ),
        },
      ]
      : []),
  ];

  return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default AcademicTable;
