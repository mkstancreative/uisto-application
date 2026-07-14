import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { Eye, Trash2 } from 'lucide-react';
import { formatDate, formatNaira } from '../../../utils/helpers';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';

function GeneralInvoiceTable({
  data = [],
  loading = false,
  onView,
  meta,
  onPageChange,
  onLimitChange,
}) {
  const columns = [
    {
      header: 'S/N',
      render: (_, i) => ((meta?.page ?? 1) - 1) * (meta?.limit ?? 10) + i + 1,
    },
    {
      header: 'Invoice ID',
      render: (row) => row.invoiceid ?? '—',
    },
    {
      header: 'Student Name',
      render: (row) =>
        row.student ? `${row.student.fname} ${row.student.lname}` : '—',
    },
    {
      header: 'Fee Name',
      render: (row) => row.fee?.name ?? '—',
    },
    {
      header: 'Amount (₦)',
      render: (row) => (row.amount != null ? formatNaira(row.amount) : '—'),
    },

    {
      header: 'Pay Status',
      render: (row) => {
        return <StatusBadge status={row.paystatus} />;
      },
    },
    {
      header: 'Date Created',
      render: (row) => formatDate(row.createdate) ?? '—',
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'View Invoice',
              icon: <Eye size={13} />,
              onClick: () => onView?.(row),
            },
            // {
            //   label: "Delete",
            //   icon: <Trash2 size={13} />,
            //   color: "red",
            //   onClick: () => onDelete?.(row),
            // },
          ]}
        />
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

export default GeneralInvoiceTable;
