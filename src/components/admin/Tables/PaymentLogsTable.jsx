import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/helpers";

function PaymentLogsTable({ data = [], loading = false, meta, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 20) + i + 1,
        },
        {
            header: "Student",
            render: (row) => {
                const s = row.student;
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                                {s ? `${s.fname} ${s.lname}` : "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                                {s?.regno ?? s?.application_no ?? ""}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Ref / TRef",
            render: (row) => (
                <code style={{ fontSize: 11, fontWeight: 600 }}>
                    {row.tref ?? "—"}
                </code>
            ),
        },
        {
            header: "Amount (₦)",
            render: (row) => (
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                    ₦{Number(row.amount ?? 0).toLocaleString()}
                </span>
            ),
        },
        {
            header: "Method",
            render: (row) => (
                <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(99,102,241,0.1)",
                    color: "#6366f1",
                }}>
                    {row.paymethod ?? "—"}
                </span>
            ),
        },
        {
            header: "Status",
            render: (row) => {
                const code = String(row.responsecode ?? "");
                const label = code === "0" ? "Success" : code === "1" ? "Failed" : "Pending";
                return <StatusBadge status={label} />;
            },
        },
        {
            header: "Date",
            render: (row) => formatDate(row.transdate ?? ""),
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

export default PaymentLogsTable;