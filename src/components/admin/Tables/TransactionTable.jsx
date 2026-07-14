import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { Eye} from 'lucide-react';
import { formatNaira, formatDate } from '../../../utils/helpers';

function TransactionTable({ data, loading, onView, meta, onPageChange, onLimitChange }) {
    const columns = [
        {
            header: "S/N",
            render: (_, index) => index + 1,
        },
        {
            header: "Student Name",
            render: (row) =>
                row.student
                    ? `${row.student.fname ?? ""} ${row.student.lname ?? ""}`.trim() || "—"
                    : "—",
        },
        {
            header: "Fee",
            render: (row) => row.fee?.name ?? "—",
        },
        {
            header: "Amount (₦)",
            render: (row) => (row.amount != null ? formatNaira(row.amount) : "—"),
        },
        {
            header: "Gateway",
            render: (row) => row.pgateway ?? "—",
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.paystatus} />,
        },
        {
            header: "Date",
            render: (row) => formatDate(row.transdate) ?? "—",
        },
        {
            header: "Actions",
            render: (row) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "View Receipt",
                            icon: <Eye size={13} />,
                            onClick: () => onView?.(row),
                        },
                    ]}
                />
            ),
        },
    ];

    /* Normalise meta: API returns `total` but GeneralTable expects `count` */
    const normalisedMeta = meta
        ? { ...meta, count: meta.total ?? meta.count }
        : null;

    return (
        <GeneralTable
            columns={columns}
            data={data}
            loading={loading}
            meta={normalisedMeta}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
        />
    );
}

export default TransactionTable;