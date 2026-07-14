import GeneralTable from '../../ui/GeneralTable/GeneralTable'
import React from 'react'

function ElectionResultTable({ data, loading }) {
    const columns = [
        { header: 'S/N', render: (_, i) => i + 1 },
        {
            header: 'Candidate',
            render: (row) => {
                // Flat API shape: student_name; nested shape: student.firstname/lastname
                const name = row.student_name
                    ? row.student_name.trim()
                    : `${row.student?.firstname ?? row.fname ?? '—'} ${row.student?.lastname ?? row.lname ?? ''}`.trim()

                const regno = row.student?.regno ?? ''

                return (
                    <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        {regno && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted,#64748b)' }}>
                                {regno}
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Position',
            // Handles both flat string ("DOS") and object shape ({ name: "DOS" })
            render: (row) => row.position?.name ?? row.position ?? '—',
        },
        {
            header: 'Total Votes',
            render: (row) => {
                let votesCount = 0
                if (Array.isArray(row.votes)) {
                    votesCount = row.votes.length
                } else if (row.votes !== undefined && row.votes !== null) {
                    votesCount = row.votes
                } else if (row.votecount !== undefined && row.votecount !== null) {
                    votesCount = row.votecount
                }

                return (
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#6366f1' }}>
                        {votesCount}
                    </span>
                )
            },
        },
    ]

    return <GeneralTable columns={columns} data={data} loading={loading} />
}

export default ElectionResultTable