import React from 'react'
import GeneralTable from '../../ui/GeneralTable/GeneralTable'
import { CheckSquare, Square } from 'lucide-react';

function PromoteStudentTable({ students, meta, isLoading, handlePageChange, handleLimitChange, toggleAll, toggleOne, selected, allSelected, departments = [], levels = [] }) {
    const columns = [
        {
            header: (
                <button
                    onClick={toggleAll}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "inherit" }}
                    title={allSelected ? "Deselect all" : "Select all"}
                >
                    {allSelected
                        ? <CheckSquare size={16} color="#ffb830" />
                        : <Square size={16} />
                    }
                </button>
            ),
            render: (row) => (
                <button
                    onClick={() => toggleOne(row.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
                >
                    {selected.includes(row.id)
                        ? <CheckSquare size={16} color="#ffb830" />
                        : <Square size={16} color="#94a3b8" />
                    }
                </button>
            ),
        },
        {
            header: "S/N",
            render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 50) + i + 1,
        },
        {
            header: "Reg No.",
            render: (row) => <code style={{ fontSize: 12, fontWeight: 700 }}>{row.regno ?? "—"}</code>,
        },
        {
            header: "Name",
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {row.fname} {row.mname} {row.lname}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{row.email ?? ""}</div>
                </div>
            ),
        },
        {
            header: "Department",
            render: (row) => {
                const dept = departments.find((d) => String(d.id) === String(row.department_id));
                return dept?.name ?? `Dept. ${row.department_id ?? "—"}`;
            },
        },
        {
            header: "Current Level",
            render: (row) => {
                const level = levels.find((l) => String(l.id) === String(row.level_id));
                return (
                    <span style={{
                        padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: "rgba(99,102,241,0.1)", color: "#6366f1",
                    }}>
                        {level?.name ?? `Level ${row.level_id ?? "—"}`}
                    </span>
                );
            },
        },
    ];

    return (
        <GeneralTable
            data={students}
            columns={columns}
            meta={meta}
            loading={isLoading}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
        />
    )
}

export default PromoteStudentTable