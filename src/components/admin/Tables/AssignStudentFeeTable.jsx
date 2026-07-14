import React from 'react';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { DollarSign } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';

function AssignStudentFeeTable({ data, loading, onAssignFee, meta, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "S/N",
            render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
        },
        {
            header: "Name",
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {row.fname} {row.lname}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{row.regno ?? ""}</div>
                </div>
            ),
        },
        { header: "Department", render: (row) => row.department?.name ?? "—" },
        { header: "Level", render: (row) => row.level?.name ?? "—" },
        {
            header: "Email",
            render: (row) => row.email ?? "—",
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[{
                        label: "Assign Fee",
                        icon: <DollarSign size={13} />,
                        onClick: () => onAssignFee?.(row),
                    }]}
                />
            ),
        },
    ];

    return (
        <GeneralTable
            data={data}
            loading={loading}
            columns={columns}
            meta={meta}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
        />
    );
}

export default AssignStudentFeeTable;