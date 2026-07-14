import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import { FileText, Printer, Trash } from "lucide-react";
import { formatDate, formatNaira } from "../../../utils/helpers";

function StudentInvoiceTable({ data = [], loading = false, onView, onDelete }) {
  const columns = [
    {
      header: "S/N",
      render: (_, index) => index + 1,
    },
    {
      header: "Invoice ID",
      render: (row) => row.invoiceid ?? "—",
    },
    {
      header: "Fee Name",
      render: (row) => row.fee?.name ?? "—",
    },
    {
      header: "Amount (₦)",
      render: (row) => formatNaira(row.amount) ?? "—",
    },
    {
      header: "Session",
      render: (row) => row.session?.name ?? "—",
    },
    {
      header: "Pay Status",
      render: (row) => {
        const s = (row.paystatus ?? "").toLowerCase();
        const isPaid = s === "paid" || s === "success";
        const color = isPaid
          ? "var(--success, #16a34a)"
          : "var(--danger, #e74c3c)";
        return (
          <span style={{ color, fontWeight: 600, textTransform: "capitalize" }}>
            {row.paystatus ?? "—"}
          </span>
        );
      },
    },
    {
      header: "Pay Date",
      render: (row) => row.payday ?? "—",
    },
    {
      header: "Date Created",
      render: (row) => formatDate(row.createdate) ?? "—",
    },
    {
      header: "Actions",
      render: (row) => {
        const isPaid =
          (row.paystatus ?? "").toLowerCase() === "paid" ||
          (row.paystatus ?? "").toLowerCase() === "success";
        return (
          <ActionDropdown
            actions={[
              {
                label: isPaid ? "Print Receipt" : "View Invoice",
                icon: isPaid ? <Printer size={13} /> : <FileText size={13} />,
                onClick: () => onView?.(row),
              },
              {
                label: "Delete",
                icon: <Trash size={13} />,
                danger: true,
                onClick: () => onDelete?.(row),
              },
            ]}
          />
        );
      },
    },
  ];

  return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default StudentInvoiceTable;
