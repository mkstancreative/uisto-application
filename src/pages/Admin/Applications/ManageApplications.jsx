import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipboardList, Download, FileText, CheckCircle2, Percent, Loader2, AlertTriangle, Filter } from 'lucide-react';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import SearchInput from '../../../components/ui/SearchInput/SearchInput';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import JobApplicantTable from '../../../components/admin/Tables/JobApplicantTable';
import JobApplicantView from '../../../components/admin/view/JobApplicantView';
import JobApplicantStatusMutate from '../../../components/admin/Mutate/JobApplicantStatusMutate';
import { flattenApplication } from '../../../components/admin/view/applicationCsv';
import { useModal } from '../../../hooks/useModal';
import { useAuth } from '../../../hooks/useAuth';
import {
  APPLICATION_STATUSES,
  SHORTLIST_STATUSES,
  useApplications,
  useStatistics,
} from '../../../hooks/useApplications';
import { jobTitle, useAllJobs } from '../../../hooks/useJobs';
import { getApplications } from '../../../api/services/applications';
import { errorMessage } from '../../../api/api';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import { downloadCsv, fileSafe } from '../../../utils/csv';
import { formatNum } from '../../../utils/helpers';
import { fetchAllPages, EXPORT_ROW_CAP } from './fetchAllPages';
import './recruitment.css';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-aiScore.overallScore', label: 'Highest AI score' },
];
const DEFAULT_SORT = '-createdAt';
const DEFAULT_LIMIT = 10;
const FILTER_KEYS = ['search', 'status', 'shortlistStatus', 'jobId', 'sort'];

const percent = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(n % 1 ? 2 : 0)}%` : '—';
};

function ManageApplications() {
  const { user } = useAuth();
  const writer = canWrite(user);
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Filters live in the query string ── */
  const filters = {
    search: searchParams.get('search') ?? '',
    status: searchParams.get('status') ?? '',
    shortlistStatus: searchParams.get('shortlistStatus') ?? '',
    jobId: searchParams.get('jobId') ?? '',
    sort: searchParams.get('sort') ?? DEFAULT_SORT,
  };
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const updateParams = (patch, { keepPage = false } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => {
          const isDefault =
            (k === 'sort' && v === DEFAULT_SORT) ||
            (k === 'limit' && Number(v) === DEFAULT_LIMIT) ||
            (k === 'page' && Number(v) === 1);
          if (v === '' || v === null || v === undefined || isDefault) next.delete(k);
          else next.set(k, String(v));
        });
        if (!keepPage) next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  /* ── Debounced search: type locally, write to the URL after a pause ── */
  const [searchText, setSearchText] = useState(() => searchParams.get('search') ?? '');
  const searchTimer = useRef(null);
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const onSearchChange = (value) => {
    setSearchText(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateParams({ search: value.trim() }), 400);
  };

  const resetFilters = () => {
    clearTimeout(searchTimer.current);
    setSearchText('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  /* ── Data ── */
  const queryParams = { ...filters, page, limit };
  const { data: res, isLoading, isFetching, isError, error, refetch } = useApplications(queryParams);
  const rows = res?.data ?? [];
  const meta = toTableMeta(res, { page, limit });

  const { data: statsRes, isLoading: statsLoading, isError: statsError } = useStatistics();
  const stats = statsRes?.data;

  const { data: jobsRes, isLoading: jobsLoading } = useAllJobs();
  const jobs = useMemo(() => jobsRes?.data ?? [], [jobsRes]);
  const selectedJob = jobs.find((j) => j._id === filters.jobId);

  const vacancyOptions = useMemo(() => {
    const opts = [{ value: '', label: jobsLoading ? 'Loading vacancies…' : 'All vacancies' }];
    jobs.forEach((j) =>
      opts.push({
        value: j._id,
        label: `${jobTitle(j)}${j.position?.cadre ? ` (${j.position.cadre})` : ''}`,
      }),
    );
    if (filters.jobId && !jobs.some((j) => j._id === filters.jobId)) {
      opts.push({ value: filters.jobId, label: 'Selected vacancy' });
    }
    return opts;
  }, [jobs, jobsLoading, filters.jobId]);

  const activeFilters = FILTER_KEYS.filter((k) => k !== 'sort' && filters[k]).length;

  /* ── Export every matching row ── */
  const [exporting, setExporting] = useState(null); // { done, total } while running

  const handleExport = async () => {
    if (exporting) return;
    setExporting({ done: 0, total: meta?.count ?? 0 });
    try {
      const { rows: all, total, truncated } = await fetchAllPages(
        ({ page: p, limit: l }) => getApplications({ ...filters, page: p, limit: l }),
        { onProgress: (done, t) => setExporting({ done, total: t }) },
      );
      if (!all.length) {
        toast.info('No applications match the current filters.');
        return;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      const scope = selectedJob ? fileSafe(jobTitle(selectedJob)) : 'all';
      downloadCsv(all.map(flattenApplication), `applications_${scope}_${stamp}`);
      if (truncated) {
        toast.warning(
          `Exported the first ${formatNum(EXPORT_ROW_CAP)} of ${formatNum(total)} applications. Narrow the filters to export the rest.`,
        );
      } else {
        toast.success(`Exported ${formatNum(all.length)} application${all.length === 1 ? '' : 's'}.`);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed. Please try again.'));
    } finally {
      setExporting(null);
    }
  };

  /* ── Modals ── */
  const handleView = (row) => openModal(<JobApplicantView id={row._id} closeModal={closeModal} />);
  const handleUpdateStatus = (row) =>
    openModal(<JobApplicantStatusMutate applicant={row} closeModal={closeModal} />);

  const summary = [
    {
      icon: <FileText size={18} />,
      label: 'Total applications',
      value: stats ? formatNum(stats.totalApplications ?? 0) : null,
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: 'Auto-shortlisted',
      value: stats ? formatNum(stats.shortlistingStats?.autoShortlisted ?? 0) : null,
    },
    {
      icon: <Percent size={18} />,
      label: 'Shortlisting rate',
      value: stats ? percent(stats.shortlistingStats?.shortlistingRate) : null,
    },
  ];

  return (
    <div className="page-container rc-page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="page-title">Applications</h2>
            <p className="page-sub">
              {isLoading
                ? 'Loading applications…'
                : `${formatNum(meta?.count ?? 0)} application${meta?.count === 1 ? '' : 's'}${
                    activeFilters ? ' match your filters' : ' received'
                  }`}
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <button
            type="button"
            className="rc-btn rc-btn-primary"
            onClick={handleExport}
            disabled={Boolean(exporting) || isLoading || isError || !meta?.count}
            title="Download every application matching the current filters"
          >
            {exporting ? <Loader2 size={15} className="rc-spin" /> : <Download size={15} />}
            {exporting
              ? `Exporting ${formatNum(exporting.done)}${exporting.total ? ` / ${formatNum(exporting.total)}` : ''}…`
              : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Summary (all vacancies) */}
      {!statsError && (
        <div className="rc-summary">
          {summary.map((s) => (
            <div key={s.label} className="rc-stat">
              <div className="rc-stat-icon">{s.icon}</div>
              <div style={{ minWidth: 0 }}>
                <span className="rc-stat-value">
                  {statsLoading || s.value === null ? <span className="rc-skel" /> : s.value}
                </span>
                <span className="rc-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="filter-wrapper">
        <SearchInput
          value={searchText}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search by applicant name or email…"
        />
      </div>

      <div className="rc-filters">
        <SelectFilter
          label="Vacancy"
          value={filters.jobId}
          onChange={(v) => updateParams({ jobId: v })}
          options={vacancyOptions}
        />
        <SelectFilter
          label="Status"
          value={filters.status}
          onChange={(v) => updateParams({ status: v })}
          options={[{ value: '', label: 'All statuses' }, ...APPLICATION_STATUSES.map((s) => ({ value: s, label: s }))]}
        />
        <SelectFilter
          label="AI shortlist"
          value={filters.shortlistStatus}
          onChange={(v) => updateParams({ shortlistStatus: v })}
          options={[{ value: '', label: 'All AI statuses' }, ...SHORTLIST_STATUSES.map((s) => ({ value: s, label: s }))]}
        />
        <SelectFilter
          label="Sort by"
          value={filters.sort === DEFAULT_SORT ? '' : filters.sort}
          onChange={(v) => updateParams({ sort: v || DEFAULT_SORT })}
          options={[
            { value: '', label: 'Newest first' },
            ...SORT_OPTIONS.filter((o) => o.value !== DEFAULT_SORT),
          ]}
        />
        <ResetButton onClick={resetFilters} disabled={!activeFilters && filters.sort === DEFAULT_SORT} />
      </div>

      {activeFilters > 0 && !isLoading && !isError && (
        <div className="rc-filter-note">
          <Filter size={13} />
          {selectedJob ? (
            <>
              Showing applications for <strong>{jobTitle(selectedJob)}</strong>
            </>
          ) : (
            'Showing filtered results'
          )}
          {isFetching && <Loader2 size={13} className="rc-spin" />}
        </div>
      )}

      {isError ? (
        <div className="rc-panel">
          <div className="rc-state error">
            <AlertTriangle size={26} />
            <strong>{errorMessage(error, 'Could not load applications.')}</strong>
            <button type="button" className="rc-btn rc-btn-sm" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <JobApplicantTable
            data={rows}
            loading={isLoading}
            meta={meta}
            onView={handleView}
            onUpdateStatus={writer ? handleUpdateStatus : undefined}
            onPageChange={(p) => updateParams({ page: p }, { keepPage: true })}
            onLimitChange={(l) => updateParams({ limit: l })}
          />
        </div>
      )}
    </div>
  );
}

export default ManageApplications;
