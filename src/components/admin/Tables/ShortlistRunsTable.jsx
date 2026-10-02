import { ArrowRight } from 'lucide-react';
import GeneralTable from '../../ui/GeneralTable/GeneralTable';
import { formatDate, formatNum } from '../../../utils/helpers';
import { formatRate } from './shortlistFormat';

/**
 * Shortlist runs (one row per generation), from GET /shortlist/:jobId or /shortlist/all.
 * Pass `vacancyTitle(row)` to show the vacancy column and `onOpen(row)` for the action.
 */
function ShortlistRunsTable({ data = [], loading, meta, onPageChange, onLimitChange, vacancyTitle, onOpen }) {
  const columns = [
    {
      header: 'Generated',
      render: (row) => (row.generationDate ? formatDate(row.generationDate) : '—'),
    },
    ...(vacancyTitle
      ? [{ header: 'Vacancy', render: (row) => <span className="rc-cell-main">{vacancyTitle(row)}</span> }]
      : []),
    {
      header: 'Applications scored',
      render: (row) => formatNum(row.totalApplications ?? 0),
    },
    {
      header: 'Shortlisted',
      render: (row) => <span className="rc-cell-main">{formatNum(row.shortlistedCount ?? 0)}</span>,
    },
    {
      header: 'Rejection rate',
      render: (row) => formatRate(row.rejectionRate),
    },
    ...(onOpen
      ? [
          {
            header: '',
            render: (row) => (
              <button type="button" className="rc-btn rc-btn-sm" onClick={() => onOpen(row)}>
                Open <ArrowRight size={13} />
              </button>
            ),
          },
        ]
      : []),
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

export default ShortlistRunsTable;
