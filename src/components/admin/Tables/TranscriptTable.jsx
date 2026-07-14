import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";
import { Eye } from "lucide-react";

function TranscriptTable({
    data = [],
    loading = false,
    meta,
    onPageChange,
    onLimitChange,
    onView,
}) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
        },
        {
            header: "Student",
            render: (row) => {
                const s = row.student;
                if (!s) return "—";
                return (
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {[s.fname, s.mname, s.lname].filter(Boolean).map((n) => n.trim()).join(" ")}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {s.regno ?? "—"} · {s.email ?? ""}
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Phone",
            render: (row) => row.student?.phone ?? "—",
        },
        {
            header: "Continent",
            render: (row) => row.continent?.name ?? "—",
        },
        {
            header: "Country",
            render: (row) => row.country?.name ?? "—",
        },
        {
            header: "Amount (₦)",
            render: (row) =>
                row.amount
                    ? Number(row.amount).toLocaleString("en-NG")
                    : "—",
        },
 
        {
            header: "Delivery Status",
            render: (row) => <StatusBadge status={row.deliverystatus} />,
        },
        {
            header: "Order Date",
            render: (row) => formatDate(row.orderdate),
        },
        {
            header: "Actions",
            render: (row) => (
                <button
                    className="tbl-action-btn"
                    title="View Transcript"
                    onClick={() => onView?.(row)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "var(--accent, #6366f1)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        transition: "opacity 0.15s",
                    }}
                >
                    <Eye size={13} /> Transcript
                </button>
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

export default TranscriptTable;
