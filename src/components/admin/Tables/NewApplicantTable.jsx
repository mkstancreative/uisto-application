import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropdown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { Pencil, FileText, CreditCard, CheckCircle } from "lucide-react";
import { formatDate } from "../../../utils/helpers";

function NewApplicantTable({
    data = [],
    loading = false,
    meta,
    onPageChange,
    onLimitChange,
    onEdit,
    onInvoice,
    onUpdateOlevel,
    onAdmit,
}) {
    const columns = [
        {
            header: "S/N",
            render: (_, index) => index + 1,
        },
        {
            header: "App. No.",
            render: (row) => (
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {row.application_no ?? "—"}
                </span>
            ),
        },
        {
            header: "Full Name",
            render: (row) =>
                [row.fname, row.mname, row.lname].filter(Boolean).join(" ") || "—",
        },

        {
            header: "Department",
            render: (row) => row.department?.name ?? "—",
        },
        {
            header: "Payment",
            render: (row) => {
                const tx = row.transactions?.[0];
                const isPaid = tx?.paystatus?.toLowerCase() === "completed";

                if (!tx) {
                    return <span style={{ color: "var(--text-muted)" }}>None</span>;
                }

                return isPaid ? (
                    <button
                        onClick={() => onAdmit?.(row)}
                        title="Admit Student"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 15px",
                            borderRadius: 20,
                            border: "none",
                            background: "linear-gradient(135deg,#22c55e,#16a34a)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
                        }}
                    >
                        <CheckCircle size={11} /> Admit
                    </button>
                ) : (
                    <StatusBadge status={tx.paystatus} />
                );
            }
        },
        {
            header: "Date Applied",
            render: (row) => formatDate(row.joindate)
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "Get Invoice",
                            icon: <CreditCard size={13} />,
                            onClick: () => onInvoice?.(row),
                        },
                        {
                            label: "Update Details",
                            icon: <Pencil size={13} />,
                            onClick: () => onEdit?.(row),
                        },
                        {
                            label: "Update O-Level",
                            icon: <FileText size={13} />,
                            onClick: () => onUpdateOlevel?.(row),
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

export default NewApplicantTable;