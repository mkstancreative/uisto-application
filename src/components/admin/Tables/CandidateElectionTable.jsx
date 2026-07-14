import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';

function CandidateElectionTable({ candidates = [], loading }) {
    const candidateColumns = [
        { header: "S/N", render: (_, i) => i + 1 },
        {
            header: "Candidate",
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>
                        {row.student?.firstname ?? row.student?.fname ?? "—"}{" "}
                        {row.student?.lastname  ?? row.student?.lname ?? ""}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted, #64748b)" }}>
                        {row.student?.regno ?? ""}
                    </div>
                </div>
            ),
        },
        {
            header: "Position",
            render: (row) => row.position?.name ?? row.position_id ?? "—",
        },
        {
            header: "Session",
            render: (row) => row.session?.name ?? row.session_id ?? "—",
        },
        {
            header: "Votes",
            render: (row) => {
                let votesCount = "0";
                if (Array.isArray(row.votes)) {
                    votesCount = row.votes.length;
                } else if (row.votes !== undefined && row.votes !== null) {
                    votesCount = row.votes;
                } else if (row.votecount !== undefined && row.votecount !== null) {
                    votesCount = row.votecount;
                }
                
                return (
                    <span style={{ fontWeight: 700, fontSize: 15 }}>
                        {votesCount}
                    </span>
                );
            },
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status ?? "Active"} />,
        },
    ];

    return (
        <GeneralTable
            columns={candidateColumns}
            data={candidates}
            loading={loading}
        />
    );
}

export default CandidateElectionTable;