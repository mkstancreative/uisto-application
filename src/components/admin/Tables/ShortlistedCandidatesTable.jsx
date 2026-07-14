import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import { formatDate } from "../../../utils/helpers";

const REC_COLOR = {
    "Highly Recommended": { color: "#16a34a", bg: "rgba(34,197,94,0.12)" },
    "Recommended": { color: "#16a34a", bg: "rgba(34,197,94,0.12)" },
    "Marginally Recommended": { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
    "Not Recommended": { color: "#dc2626", bg: "rgba(239,68,68,0.1)" },
};

function ShortlistedCandidatesTable({ data = [], loading, meta, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "#",
            render: (_, i) => i + 1,
        },
        {
            header: "Name",
            render: (row) => (
                <span style={{ fontWeight: 600 }}>{row.name}</span>
            ),
        },
        {
            header: "Email",
            render: (row) => (
                <span style={{ fontSize: 13, color: "var(--text-color-light)" }}>{row.email}</span>
            ),
        },
        {
            header: "Overall Score",
            render: (row) => (
                <span style={{ fontWeight: 700, fontSize: 15 }}>{row.overallScore ?? "—"} / 100</span>
            ),
        },
        {
            header: "Recommendation",
            render: (row) => {
                const style = REC_COLOR[row.recommendation] ?? { color: "#64748b", bg: "rgba(148,163,184,0.1)" };
                return (
                    <span style={{
                        padding: "3px 12px", borderRadius: 20, fontSize: 12,
                        fontWeight: 700, background: style.bg, color: style.color,
                        whiteSpace: "nowrap",
                    }}>
                        {row.recommendation ?? "—"}
                    </span>
                );
            },
        },
        {
            header: "Date generation",
            render: (row) => formatDate(row.appliedAt),
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

export default ShortlistedCandidatesTable;
