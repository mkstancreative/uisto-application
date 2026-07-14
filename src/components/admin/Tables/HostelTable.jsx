import React from 'react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import ActionDropdown from '../../ui/ActionDropdown/ActionDropdown';
import { Pencil, Trash2 } from 'lucide-react';

function HostelTable({ data = [], loading = false, onEdit }) {
  const columns = [
    {
      header: 'S/N',
      render: (_, index) => index + 1,
    },
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Address',
      accessor: 'address',
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: 'Edit',
              icon: <Pencil size={13} />,
              onClick: () => onEdit?.(row),
            },
          ]}
        />
      ),
    },
  ];

  return <GeneralTable columns={columns} data={data} loading={loading} />;
}

export default HostelTable;
