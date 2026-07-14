import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { RotateCcw } from "lucide-react";
import { formatOnlyDate } from "../../../utils/helpers";

/* ── Helper: check overdue ── */
const isOverdueLoan = (row) => {
  if (!row?.toreturn || row.returned === "Yes") return false;
  return new Date(row.toreturn) < new Date();
};

function LoanActivitiesTable({
  data = [],
  loading = false,
  meta,
  onPageChange,
  onLimitChange,
  onReturn,
  onPenalty,
}) {
  const columns = [
    {
      header: "S/N",
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
    },

    {
      header: "Book",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.book?.title}</div>
        </div>
      ),
    },

    {
      header: "Student",
      render: (row) => (
        <code
          style={{
            fontSize: 12,
            padding: "2px 6px",
            background: "rgba(0,0,0,0.05)",
            borderRadius: 4,
          }}
        >
          {row.student?.fname + " " + row.student?.lname}
        </code>
      ),
    },

    {
      header: "Borrowed",
      render: (row) => (
        <span style={{ fontSize: 12 }}>{formatOnlyDate(row.borroweddate)}</span>
      ),
    },

    {
      header: "To Return",
      render: (row) => {
        const overdue = isOverdueLoan(row);

        return (
          <span
            style={{
              fontSize: 12,
              color: overdue ? "#ef4444" : "inherit",
              fontWeight: overdue ? 700 : 400,
            }}
          >
            {row.toreturn ? formatOnlyDate(new Date(row.toreturn)) : "-"}

            {overdue && (
              <span
                style={{
                  marginLeft: 4,
                  fontSize: 10,
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  padding: "1px 5px",
                  borderRadius: 4,
                }}
              >
                OVERDUE
              </span>
            )}
          </span>
        );
      },
    },

    // {
    //   header: "Penalty",
    //   render: (row) => (
    //     <span
    //       style={{
    //         color:
    //           Number(row.penalty) > 0 ? "#ef4444" : "#22c55e",
    //         fontWeight: 600,
    //         fontSize: 12,
    //       }}
    //     >
    //       {Number(row.penalty) > 0
    //         ? `₦${row.penalty}`
    //         : "None"}
    //     </span>
    //   ),
    // },

    {
      header: "Status",
      render: (row) => (
        <span
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 20,
            fontWeight: 600,
            background:
              row.returned === "Yes"
                ? "rgba(34,197,94,0.1)"
                : "rgba(245,158,11,0.12)",
            color: row.returned === "Yes" ? "#22c55e" : "#f59e0b",
          }}
          className="whitespace-nowrap"
        >
          {row.returned === "Yes" ? "Returned" : "Loaned Out"}
        </span>
      ),
    },

    {
      header: "Paid",
      render: (row) => (
        <span
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 20,
            fontWeight: 600,
            background:
              row.paid === "Yes"
                ? "rgba(34,197,94,0.1)"
                : "rgba(239,68,68,0.08)",
            color: row.paid === "Yes" ? "#22c55e" : "#ef4444",
          }}
        >
          {row.paid === "Yes" ? "Paid" : "none"}
        </span>
      ),
    },

    {
      header: "Condition",
      render: (row) => (
        <span
          style={{ fontSize: 12, color: "#94a3b8" }}
          className="whitespace-nowrap"
        >
          {row.status ?? "—"}
        </span>
      ),
    },

    {
      header: "Actions",
      render: (row) => {
        const overdue = isOverdueLoan(row);

        const disableReturn =
          row.returned === "Yes" || (overdue && row.paid !== "Yes");

        return (
          <ActionDropdown
            actions={[
              {
                label: "Mark Returned",
                icon: <RotateCcw size={13} />,
                disabled: disableReturn,
                onClick: () => onReturn?.(row),
              },
              {
                label: "Collect Penalty",
                icon: <RotateCcw size={13} color="#ef4444" />,
                disabled: !overdue,
                onClick: () => onPenalty?.(row),
              },
            ]}
          />
        );
      },
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
      emptyMessage="No loan activities found."
    />
  );
}

export default LoanActivitiesTable;
