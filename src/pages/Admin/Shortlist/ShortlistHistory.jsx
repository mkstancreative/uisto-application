import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { History, Download, Loader2, AlertTriangle, Filter } from 'lucide-react';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import ShortlistRunsTable from '../../../components/admin/Tables/ShortlistRunsTable';
import { formatRate } from '../../../components/admin/Tables/shortlistFormat';
import { AI_RECOMMENDATIONS, useAllShortlistRuns } from '../../../hooks/useShortlist';
import { jobTitle, useAllJobs } from '../../../hooks/useJobs';
import { getAllShortlistRuns } from '../../../api/services/shortlist';
import { errorMessage } from '../../../api/api';
import { toTableMeta } from '../../../utils/pagination';
import { downloadCsv } from '../../../utils/csv';
import { formatDate, formatNum } from '../../../utils/helpers';
import useDebouncedValue from '../Applications/useDebouncedValue';
import { fetchAllPages, EXPORT_ROW_CAP } from '../Applications/fetchAllPages';
import '../Applications/recruitment.css';

const EMPTY_FILTERS = { jobId: '', aiRecommendation: '', startDate: '', endDate: '' };

/** jobId on a run may be a plain id or a populated job document. */
const runJobId = (row) => (row?.jobId && typeof row.jobId === 'object' ? row.jobId._id : row?.jobId);

function ShortlistHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, jobId: searchParams.get('jobId') ?? '' }));
  const [paging, setPaging] = useState({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPaging((prev) => ({ ...prev, page: 1 }));
  };
  const onSearch = (value) => {
    setSearch(value);
    setPaging((prev) => ({ ...prev, page: 1 }));
  };
  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
    setPaging((prev) => ({ ...prev, page: 1 }));
  };

  const queryFilters = { ...filters, search: debouncedSearch };
  const { data: res, isLoading, isFetching, isError, error, refetch } = useAllShortlistRuns({
    ...queryFilters,
    ...paging,
  });
  const rows = res?.data ?? [];
  const meta = toTableMeta(res, paging);

  const { data: jobsRes, isLoading: jobsLoading } = useAllJobs();
  const jobs = useMemo(() => jobsRes?.data ?? [], [jobsRes]);
  const jobsById = useMemo(() => new Map(jobs.map((j) => [j._id, j])), [jobs]);

  const vacancyTitle = (row) => {
    if (row?.jobId && typeof row.jobId === 'object') return jobTitle(row.jobId);
    const job = jobsById.get(row?.jobId);
    if (job) return jobTitle(job);
    return jobsLoading ? 'Loading…' : 'Unknown vacancy';
  };

  const vacancyOptions = useMemo(
    () => [
      { value: '', label: jobsLoading ? 'Loading vacancies…' : 'All vacancies' },
      ...jobs.map((j) => ({
        value: j._id,
        label: `${jobTitle(j)}${j.position?.cadre ? ` (${j.position.cadre})` : ''}`,
      })),
    ],
    [jobs, jobsLoading],
  );

  const activeCount = Object.values(filters).filter(Boolean).length + (debouncedSearch ? 1 : 0);

  /* ── Export every matching run ── */
  const [exporting, setExporting] = useState(null);
  const handleExport = async () => {
    if (exporting) return;
    setExporting({ done: 0, total: meta?.count ?? 0 });
    try {
      const { rows: all, total, truncated } = await fetchAllPages(
        ({ page, limit }) => getAllShortlistRuns({ ...queryFilters, page, limit }),
        { onProgress: (done, t) => setExporting({ done, total: t }) },
      );
      if (!all.length) {
        toast.info('No shortlist runs match the current filters.');
        return;
      }
      downloadCsv(
        all.map((r) => ({
          Vacancy: vacancyTitle(r),
          'Vacancy ID': runJobId(r) ?? '',
          'Generated At': r.generationDate ? formatDate(r.generationDate) : '',
          'Applications Scored': r.totalApplications ?? '',
          Shortlisted: r.shortlistedCount ?? '',
          'Rejection Rate': formatRate(r.rejectionRate),
          'Run ID': r._id ?? '',
        })),
        `shortlist_runs_${new Date().toISOString().slice(0, 10)}`,
      );
      if (truncated) {
        toast.warning(`Exported the first ${formatNum(EXPORT_ROW_CAP)} of ${formatNum(total)} runs.`);
      } else {
        toast.success(`Exported ${formatNum(all.length)} run${all.length === 1 ? '' : 's'}.`);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed. Please try again.'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="page-container rc-page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <History size={20} />
          </div>
          <div>
            <h2 className="page-title">Shortlist History</h2>
            <p className="page-sub">
              {isLoading
                ? 'Loading…'
                : `${formatNum(meta?.count ?? 0)} shortlist run${meta?.count === 1 ? '' : 's'} across all vacancies`}
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <button
            type="button"
            className="rc-btn rc-btn-primary"
            onClick={handleExport}
            disabled={Boolean(exporting) || isLoading || isError || !meta?.count}
          >
            {exporting ? <Loader2 size={15} className="rc-spin" /> : <Download size={15} />}
            {exporting
              ? `Exporting ${formatNum(exporting.done)}${exporting.total ? ` / ${formatNum(exporting.total)}` : ''}…`
              : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={search}
          onChange={onSearch}
          onClear={() => onSearch('')}
          placeholder="Search shortlist runs…"
        />
      </div>

      <div className="rc-filters">
        <SelectFilter
          label="Vacancy"
          value={filters.jobId}
          onChange={(v) => setFilter('jobId', v)}
          options={vacancyOptions}
        />
        <SelectFilter
          label="AI recommendation"
          value={filters.aiRecommendation}
          onChange={(v) => setFilter('aiRecommendation', v)}
          options={[{ value: '', label: 'All recommendations' }, ...AI_RECOMMENDATIONS.map((r) => ({ value: r, label: r }))]}
        />
        <div className="filter-container">
          <label className="filter-label" htmlFor="sh-start">Generated from</label>
          <input
            id="sh-start"
            type="date"
            className="filter-select rc-date-input"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => setFilter('startDate', e.target.value)}
          />
        </div>
        <div className="filter-container">
          <label className="filter-label" htmlFor="sh-end">Generated to</label>
          <input
            id="sh-end"
            type="date"
            className="filter-select rc-date-input"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => setFilter('endDate', e.target.value)}
          />
        </div>
        <ResetButton onClick={reset} disabled={!activeCount && !search} />
      </div>

      {activeCount > 0 && !isError && (
        <div className="rc-filter-note">
          <Filter size={13} /> Showing filtered results
          {isFetching && <Loader2 size={13} className="rc-spin" />}
        </div>
      )}

      {isError ? (
        <div className="rc-panel">
          <div className="rc-state error">
            <AlertTriangle size={26} />
            <strong>{errorMessage(error, 'Could not load shortlist history.')}</strong>
            <button type="button" className="rc-btn rc-btn-sm" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <ShortlistRunsTable
            data={rows}
            loading={isLoading}
            meta={meta}
            vacancyTitle={vacancyTitle}
            onOpen={(row) => {
              const id = runJobId(row);
              if (id) navigate(`/admin/shortlist?jobId=${id}`);
            }}
            onPageChange={(p) => setPaging((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setPaging({ page: 1, limit: l })}
          />
        </div>
      )}
    </div>
  );
}

export default ShortlistHistory;
