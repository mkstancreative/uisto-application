import React from 'react'
import { formatDate } from '../../../utils/helpers';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';

function ActivityLogsTable({ data, loading, meta, onPageChange, onLimitChange }) {

    const columns = [
        {
            header: "#",
            render: (_, i) =>
                ((meta.page - 1) * meta.limit) + i + 1,
        },
        {
            header: "Title",
            accessor: "title",
        },
        {
            header: "Description",
            accessor: "description",
        },
        {
            header: "User",
            accessor: "user_name",
        },
        {
            header: "IP Address",
            accessor: "ip",
        },
        {
            header: "Date & Time",
            render: (row) => (
                formatDate(row.timestamp)
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
            emptyMessage="No activity logs found."
        />
    )
}

export default ActivityLogsTable