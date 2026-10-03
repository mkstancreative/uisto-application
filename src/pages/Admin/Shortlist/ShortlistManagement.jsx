import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ListChecks, Sparkles, Loader2, AlertTriangle, History, Trophy, Download, Briefcase,
  ClipboardList, Info, CheckCircle2,
} from 'lucide-react';
import SelectFilter from '../../../components/ui/SelectFilters/SelectFilters';
import ResetButton from '../../../components/ui/ResetButton/ResetButton';
import ConfirmModal from '../../../components/ui/ConfirmModal/ConfirmModal';
import GeneralTable from '../../../components/ui/GeneralTable/GeneralTable';
import StatusBadge from '../../../components/ui/StatusBadge/StatusBadge';
import ShortlistedCandidatesTable from '../../../components/admin/Tables/ShortlistedCandidatesTable';
import ShortlistRunsTable from '../../../components/admin/Tables/ShortlistRunsTable';
import JobApplicantView from '../../../components/admin/view/JobApplicantView';
import { formatRate } from '../../../components/admin/Tables/shortlistFormat';
import { useModal } from '../../../hooks/useModal';
import { useAuth } from '../../../hooks/useAuth';
import { jobTitle, useAllJobs } from '../../../hooks/useJobs';
import {
  AI_RECOMMENDATIONS,
  useExportShortlist,
  useGenerateShortlist,
  useJobShortlistRuns,
  useShortlistedCandidates,
} from '../../../hooks/useShortlist';
import { errorMessage } from '../../../api/api';
import { canWrite } from '../../../utils/roles';
import { toTableMeta } from '../../../utils/pagination';
import { downloadCsv, fileSafe } from '../../../utils/csv';
import { formatDate, formatDeadline, formatNum } from '../../../utils/helpers';
import useDebouncedValue from '../Applications/useDebouncedValue';
import '../Applications/recruitment.css';

const DEFAULT_MIN_SCORE = 40;
const DEFAULT_CANDIDATE_SORT = '-aiScore.overallScore';
const CANDIDATE_SORTS = [
  { value: '', label: 'Highest score first' },
  { value: 'aiScore.overallScore', label: 'Lowest score first' },
  { value: '-appliedAt', label: 'Newest applications' },
  { value: 'appliedAt', label: 'Oldest applications' },
];

const isOpenJob = (job) => Boolean(job?.isOpen ?? job?.isActive);

/** "40" → 40, anything outside 0–100 or non-numeric → null. */
const parseScore = (text) => {
  if (text === '' || text === null || text === undefined) return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

function PanelError({ error, fallback, onRetry }) {
  return (
    <div className="rc-state error">
      <AlertTriangle size={24} />
      <strong>{errorMessage(error, fallback)}</strong>
      {onRetry && (
        <button type="button" className="rc-btn rc-btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Generated run summary
════════════════════════════════════════ */
function RunResult({ run, onView }) {
  const criteria = run.criteriaUsed ?? {};
  const reasons = Array.isArray(run.shortlistedCandidates) ? run.shortlistedCandidates : [];

  return (
    <div className="rc-panel">
      <div className="rc-panel-head">
        <div>
          <h3 className="rc-panel-title">
            <CheckCircle2 size={16} /> Shortlist generated
          </h3>
          <p className="rc-panel-sub">{run.generationDate ? formatDate(run.generationDate) : 'Just now'}</p>
        </div>
      </div>

      <div className="rc-kv-grid">
        <div className="rc-kv">
          <span className="rc-kv-label">Applications scored</span>
          <span className="rc-kv-value">{formatNum(run.totalApplications ?? 0)}</span>
        </div>
        <div className="rc-kv">
          <span className="rc-kv-label">Shortlisted</span>
          <span className="rc-kv-value">{formatNum(run.shortlistedCount ?? reasons.length)}</span>
        </div>
        <div className="rc-kv">
          <span className="rc-kv-label">Rejection rate</span>
          <span className="rc-kv-value">{formatRate(run.rejectionRate)}</span>
        </div>
        <div className="rc-kv">
          <span className="rc-kv-label">Minimum score</span>
          <span className="rc-kv-value">{criteria.minOverallScore ?? '—'}</span>
        </div>
        <div className="rc-kv">
          <span className="rc-kv-label">Min. experience</span>
          <span className="rc-kv-value">
            {criteria.minExperienceYears !== undefined && criteria.minExperienceYears !== null
              ? `${criteria.minExperienceYears} yrs`
              : '—'}
          </span>
        </div>
      </div>

      {criteria.requiredQualifications?.length > 0 && (
        <>
          <p className="rc-subhead">Required qualifications used</p>
          <ul className="rc-list">
            {criteria.requiredQualifications.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </>
      )}

      {reasons.length > 0 && (
        <>
          <p className="rc-subhead">Why candidates were shortlisted</p>
          <GeneralTable
            data={reasons}
            columns={[
              { header: '#', render: (_, i) => i + 1 },
              {
                header: 'Score',
                render: (r) => <span className="rc-score-num">{r.overallScore ?? '—'}</span>,
              },
              {
                header: 'Recommendation',
                render: (r) => (r.aiRecommendation ? <StatusBadge status={r.aiRecommendation} /> : '—'),
              },
              { header: 'Reason', render: (r) => r.shortlistReason || '—' },
              {
                header: '',
                render: (r) =>
                  r.applicationId ? (
                    <button type="button" className="rc-btn rc-btn-sm" onClick={() => onView(r.applicationId)}>
                      View
                    </button>
                  ) : null,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Ranked candidates
════════════════════════════════════════ */
const INITIAL_CANDIDATE_FILTERS = {
  minScore: '',
  recommendation: '',
  fromDate: '',
  toDate: '',
  sort: '',
  page: 1,
  limit: 10,
};

function CandidatesPanel({ jobId, title, onView }) {
  const [f, setF] = useState(INITIAL_CANDIDATE_FILTERS);
  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value, page: 1 }));

  const debouncedMin = useDebouncedValue(f.minScore, 450);
  const minScore = parseScore(debouncedMin);
  const minInvalid = f.minScore !== '' && parseScore(f.minScore) === null;

  const params = {
    minScore: minScore ?? undefined,
    recommendation: f.recommendation,
    fromDate: f.fromDate,
    toDate: f.toDate,
    sort: f.sort || DEFAULT_CANDIDATE_SORT,
    page: f.page,
    limit: f.limit,
  };
  const { data: res, isLoading, isError, error, refetch } = useShortlistedCandidates(jobId, params);
  const rows = res?.data ?? [];
  const meta = toTableMeta(res, { page: f.page, limit: f.limit });

  const { mutate: runExport, isPending: exporting } = useExportShortlist();
  const handleExport = () => {
    runExport(
      { jobId, params: { minScore: minScore ?? undefined, recommendation: f.recommendation } },
      {
        onSuccess: (out) => {
          const exportRows = Array.isArray(out?.data) ? out.data : [];
          if (!exportRows.length) {
            toast.info('No shortlisted candidates match the score and recommendation filters.');
            return;
          }
          downloadCsv(exportRows, `shortlist_${fileSafe(title)}`);
          toast.success(`Exported ${formatNum(exportRows.length)} candidate${exportRows.length === 1 ? '' : 's'}.`);
        },
        onError: (err) => toast.error(errorMessage(err, 'Export failed. Please try again.')),
      },
    );
  };

  const filtered = f.minScore || f.recommendation || f.fromDate || f.toDate || f.sort;

  return (
    <div className="rc-panel">
      <div className="rc-panel-head">
        <div>
          <h3 className="rc-panel-title">
            <Trophy size={16} /> Ranked candidates
          </h3>
          <p className="rc-panel-sub">
            {isLoading ? 'Loading…' : `${formatNum(meta?.count ?? 0)} candidate${meta?.count === 1 ? '' : 's'}`}
            {' · '}the list you work from when issuing interview invitations
          </p>
        </div>
        <button
          type="button"
          className="rc-btn"
          onClick={handleExport}
          disabled={exporting || isError || minInvalid}
          title="Export uses the minimum-score and recommendation filters"
        >
          {exporting ? <Loader2 size={15} className="rc-spin" /> : <Download size={15} />}
          {exporting ? 'Preparing…' : 'Export CSV'}
        </button>
      </div>

      <div className="rc-filters" style={{ marginBottom: 14 }}>
        <div className="filter-container">
          <label className="filter-label" htmlFor="cand-min">Min. score</label>
          <input
            id="cand-min"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            className="filter-select rc-date-input"
            placeholder="0–100"
            value={f.minScore}
            onChange={(e) => set('minScore', e.target.value)}
            aria-invalid={minInvalid}
          />
        </div>
        <SelectFilter
          label="Recommendation"
          value={f.recommendation}
          onChange={(v) => set('recommendation', v)}
          options={[{ value: '', label: 'All recommendations' }, ...AI_RECOMMENDATIONS.map((r) => ({ value: r, label: r }))]}
        />
        <div className="filter-container">
          <label className="filter-label" htmlFor="cand-from">Applied from</label>
          <input
            id="cand-from"
            type="date"
            className="filter-select rc-date-input"
            value={f.fromDate}
            max={f.toDate || undefined}
            onChange={(e) => set('fromDate', e.target.value)}
          />
        </div>
        <div className="filter-container">
          <label className="filter-label" htmlFor="cand-to">Applied to</label>
          <input
            id="cand-to"
            type="date"
            className="filter-select rc-date-input"
            value={f.toDate}
            min={f.fromDate || undefined}
            onChange={(e) => set('toDate', e.target.value)}
          />
        </div>
        <SelectFilter label="Sort" value={f.sort} onChange={(v) => set('sort', v)} options={CANDIDATE_SORTS} />
        <ResetButton onClick={() => setF(INITIAL_CANDIDATE_FILTERS)} disabled={!filtered} />
      </div>

      {minInvalid && (
        <p className="rc-hint" style={{ marginTop: -6, marginBottom: 10, color: '#dc2626' }}>
          Minimum score must be a number from 0 to 100.
        </p>
      )}

      {isError ? (
        <PanelError error={error} fallback="Could not load candidates." onRetry={() => refetch()} />
      ) : (
        <ShortlistedCandidatesTable
          data={rows}
          loading={isLoading}
          meta={meta}
          onView={(row) => onView(row._id)}
          onPageChange={(p) => setF((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setF((prev) => ({ ...prev, limit: l, page: 1 }))}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Run history for one vacancy
════════════════════════════════════════ */
function RunHistoryPanel({ jobId }) {
  const [paging, setPaging] = useState({ page: 1, limit: 10 });
  const { data: res, isLoading, isError, error, refetch } = useJobShortlistRuns(jobId, paging);
  const rows = res?.data ?? [];
  const meta = toTableMeta(res, paging);

  return (
    <div className="rc-panel">
      <div className="rc-panel-head">
        <div>
          <h3 className="rc-panel-title">
            <History size={16} /> Run history
          </h3>
          <p className="rc-panel-sub">Every shortlist generated for this vacancy, newest first.</p>
        </div>
      </div>
      {isError ? (
        <PanelError error={error} fallback="Could not load run history." onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <div className="rc-state">
          <History size={22} />
          <span>No shortlist has been generated for this vacancy yet.</span>
        </div>
      ) : (
        <ShortlistRunsTable
          data={rows}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setPaging((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setPaging({ page: 1, limit: l })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Page
════════════════════════════════════════ */
function ShortlistManagement() {
  const { user } = useAuth();
  const writer = canWrite(user);
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') ?? '';

  const { data: jobsRes, isLoading: jobsLoading, isError: jobsError, error: jobsErr, refetch: refetchJobs } =
    useAllJobs();
  const jobs = useMemo(() => jobsRes?.data ?? [], [jobsRes]);
  const job = jobs.find((j) => j._id === jobId);
  const title = job ? jobTitle(job) : 'vacancy';

  const jobOptions = useMemo(() => {
    const opts = [{ value: '', label: jobsLoading ? 'Loading vacancies…' : '— Choose a vacancy —' }];
    jobs.forEach((j) => {
      const bits = [jobTitle(j), j.position?.cadre, isOpenJob(j) ? 'Open' : 'Closed'].filter(Boolean);
      opts.push({ value: j._id, label: bits.join(' · ') });
    });
    if (jobId && !jobsLoading && !jobs.some((j) => j._id === jobId)) {
      opts.push({ value: jobId, label: 'Unknown vacancy' });
    }
    return opts;
  }, [jobs, jobsLoading, jobId]);

  /* ── Generation (kept here so switching vacancy can be blocked while it runs) ── */
  const [minScore, setMinScore] = useState(String(DEFAULT_MIN_SCORE));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastRun, setLastRun] = useState(null); // { jobId, run }
  const [generatingFor, setGeneratingFor] = useState(null);
  const { mutate: generate, isPending: generating } = useGenerateShortlist();
  const minScoreValue = parseScore(minScore);

  const selectJob = (value) => {
    if (generating) {
      toast.info('Wait for the current shortlist to finish generating before switching vacancy.');
      return;
    }
    setSearchParams(value ? { jobId: value } : {}, { replace: false });
  };

  const startGeneration = () => {
    if (!writer || !jobId || minScoreValue === null) return;
    setConfirmOpen(false);
    const target = jobId;
    setGeneratingFor(target);
    generate(
      { jobId: target, minScore: minScoreValue },
      {
        onSuccess: (res) => {
          setLastRun({ jobId: target, run: res?.data ?? {} });
          toast.success(res?.message || 'Shortlist generated.');
        },
        onError: (err) => toast.error(errorMessage(err, 'Could not generate the shortlist.')),
        onSettled: () => setGeneratingFor(null),
      },
    );
  };

  const viewApplication = (id) => openModal(<JobApplicantView id={id} closeModal={closeModal} />);

  const runForJob = lastRun?.jobId === jobId ? lastRun.run : null;
  const busyHere = generating && generatingFor === jobId;

  return (
    <div className="page-container rc-page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ListChecks size={20} />
          </div>
          <div>
            <h2 className="page-title">Shortlist by Vacancy</h2>
            <p className="page-sub">Score applications with AI and work through the ranked candidates.</p>
          </div>
        </div>
        <div className="page-header-right">
          <Link to="/admin/shortlist-history" className="rc-btn" style={{ textDecoration: 'none' }}>
            <History size={15} /> All runs
          </Link>
        </div>
      </div>

      {/* ── Vacancy picker ── */}
      <div className="rc-panel">
        {jobsError ? (
          <PanelError error={jobsErr} fallback="Could not load vacancies." onRetry={() => refetchJobs()} />
        ) : (
          <>
            <SelectFilter label="Vacancy" value={jobId} onChange={selectJob} options={jobOptions} />
            {generating && (
              <p className="rc-hint">A shortlist is being generated — stay on this vacancy until it finishes.</p>
            )}
            {job && (
              <div className="rc-filter-note" style={{ marginTop: 12 }}>
                <Briefcase size={13} />
                <strong>{jobTitle(job)}</strong>
                {job.position?.department && <span>· {job.position.department}</span>}
                {job.applicationDeadline && <span>· closes {formatDeadline(job.applicationDeadline)}</span>}
                <StatusBadge status={isOpenJob(job) ? 'Open' : 'Closed'} />
                <Link to={`/admin/applications?jobId=${jobId}`} className="rc-link-btn" style={{ marginLeft: 'auto' }}>
                  <ClipboardList size={13} style={{ verticalAlign: '-2px' }} /> View applications
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {!jobId ? (
        <div className="rc-panel">
          <div className="rc-state">
            <ListChecks size={26} />
            <span>Choose a vacancy above to see its shortlist{writer ? ' or generate a new one' : ''}.</span>
          </div>
        </div>
      ) : (
        <>
          {!writer && (
            <div className="rc-alert info">
              <Info size={15} />
              <span>Your role is read-only. A Registrar or HR Manager can generate shortlists.</span>
            </div>
          )}

          {/* ── Generate ── */}
          {writer && (
            <div className="rc-panel">
              <div className="rc-panel-head">
                <div>
                  <h3 className="rc-panel-title">
                    <Sparkles size={16} /> Generate shortlist
                  </h3>
                  <p className="rc-panel-sub">
                    Candidates scoring at or above the minimum are marked Auto-Shortlisted.
                  </p>
                </div>
              </div>

              <div className="rc-form-row">
                <div className="rc-field">
                  <label className="filter-label" htmlFor="gen-min">Minimum score (0–100)</label>
                  <input
                    id="gen-min"
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    className="filter-select rc-date-input"
                    style={{ width: 180, maxWidth: '100%' }}
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    disabled={generating}
                    aria-invalid={minScoreValue === null}
                  />
                </div>
                <button
                  type="button"
                  className="rc-btn rc-btn-primary"
                  onClick={() => setConfirmOpen(true)}
                  disabled={generating || minScoreValue === null}
                >
                  {busyHere ? <Loader2 size={15} className="rc-spin" /> : <Sparkles size={15} />}
                  {busyHere ? 'Generating…' : 'Generate shortlist'}
                </button>
              </div>
              {minScoreValue === null && (
                <p className="rc-hint" style={{ color: '#dc2626' }}>Enter a score from 0 to 100.</p>
              )}

              {busyHere && (
                <div className="rc-alert info" style={{ marginTop: 14, flexDirection: 'column', gap: 10 }}>
                  <div className="rc-progress" style={{ width: '100%' }} />
                  <span>
                    Scoring every application for <strong>{title}</strong>. On a large pool this can take a few
                    minutes — keep this page open until it finishes.
                  </span>
                </div>
              )}
              {generating && !busyHere && (
                <p className="rc-hint">Another shortlist is being generated. Wait for it to finish.</p>
              )}
            </div>
          )}

          {runForJob && <RunResult run={runForJob} onView={viewApplication} />}

          <CandidatesPanel key={jobId} jobId={jobId} title={title} onView={viewApplication} />
          <RunHistoryPanel key={`runs-${jobId}`} jobId={jobId} />
        </>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        variant="danger"
        title="Generate a new shortlist?"
        message={
          <>
            This re-scores <strong>every application</strong> for {title} and <strong>overwrites</strong> their
            current AI scores, then replaces the previous shortlist for this vacancy. Candidates scoring{' '}
            {minScoreValue ?? DEFAULT_MIN_SCORE} or higher will be marked Auto-Shortlisted. It can take a few
            minutes on large pools.
          </>
        }
        confirmText="Generate"
        onConfirm={startGeneration}
        onCancel={() => setConfirmOpen(false)}
      />

    </div>
  );
}

export default ShortlistManagement;
