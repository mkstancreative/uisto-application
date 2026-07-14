import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate } from '../../../utils/helpers';

function PositionElectionTable({ positions = [], loading, handleEditPosition, handleDeletePosition }) {
    const positionColumns = [
        { header: "S/N", render: (_, i) => i + 1 },
        {
            header: "Position",
            render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
        },
        {
            header: "Voting Starts",
            render: (row) => formatDate(row.votingstarts) ?? "—",
        },
        {
            header: "Voting Ends",
            render: (row) => formatDate(row.votingends) ?? "—",
        },
        {
            header: "Status",
            render: (row) => {
                const now = new Date();
                const start = row.votingstarts ? new Date(row.votingstarts) : null;
                const end   = row.votingends   ? new Date(row.votingends)   : null;
                let status = "Inactive";
                if (start && end && now >= start && now <= end) status = "Active";
                else if (end && now > end)                      status = "Ended";
                return <StatusBadge status={status} />;
            },
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "Edit",
                            icon:  <Pencil size={13} />,
                            onClick: () => handleEditPosition(row),
                        },
                        {
                            label:   "Delete",
                            icon:    <Trash2 size={13} />,
                            danger:  true,
                            onClick: () => handleDeletePosition(row),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <GeneralTable
            columns={positionColumns}
            data={positions}
            loading={loading}
        />
    );
}

export default PositionElectionTable;