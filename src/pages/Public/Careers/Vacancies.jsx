import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Search,
  SearchX,
  TriangleAlert,
} from 'lucide-react';
import PublicLayout from '../../../components/public/PublicLayout';
import { useVacancies } from '../../../hooks/useCareers';
import { errorMessage } from '../../../api/api';
import StateCard from '../shared/StateCard';
import VacancyCard, { VacancyCardSkeleton } from './VacancyCard';
import { subcadreId, subcadreName } from '../shared/utils';
import './careers.css';

const LIMIT = 9;
const DEBOUNCE_MS = 350;
const CADRES = ['Academic', 'Non-Academic'];
const DEFAULT_CADRE = 'Academic';
const FILTER_KEYS = ['search', 'cadre', 'department', 'subcadre', 'page'];

/** Page numbers with gaps: 1 … 4 5 [6] 7 8 … 20 */
const pageWindow = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

function Pagination({ page, pages, total, onChange, disabled }) {
  if (pages <= 1) return null;
  const from = (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);
  return (
    <nav className="cr-pager" aria-label="Vacancy pages">
      <span className="cr-pager-info">
        Showing {from}–{to} of {total}
      </span>
      <div className="cr-pager-btns">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pageWindow(page, pages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="cr-pager-gap">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              className={p === page ? 'active' : undefined}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
              disabled={disabled}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={disabled || page >= pages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

function Vacancies() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  /* One cadre is always selected; Academic unless the URL says otherwise */
  const cadre = CADRES.includes(params.get('cadre')) ? params.get('cadre') : DEFAULT_CADRE;
  const isAcademic = cadre === 'Academic';
  const department = params.get('department') ?? '';
  const subcadre = params.get('subcadre') ?? '';
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);

  /* Text inputs update instantly; the URL (and the request) follow after a pause */
  const [searchText, setSearchText] = useState(search);
  const [deptText, setDeptText] = useState(department);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [syncedDept, setSyncedDept] = useState(department);
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchText(search);
  }
  if (syncedDept !== department) {
    setSyncedDept(department);
    setDeptText(department);
  }

  const timers = useRef({});
  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  const update = (patch, { replace = false } = {}) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => {
          if (v === '' || v === null || v === undefined || (k === 'page' && Number(v) <= 1)) next.delete(k);
          else next.set(k, String(v));
        });
        if (!('page' in patch)) next.delete('page');
        return next;
      },
      { replace },
    );
  };

  const debounced = (key, value) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => update({ [key]: value.trim() }, { replace: true }), DEBOUNCE_MS);
  };

  const resetFilters = () => {
    Object.values(timers.current).forEach(clearTimeout);
    setSearchText('');
    setDeptText('');
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      FILTER_KEYS.forEach((k) => next.delete(k));
      return next;
    });
  };

  const goToPage = (p) => {
    update({ page: p });
    document.getElementById('cr-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const query = useVacancies({ page, limit: LIMIT, search, cadre, department, subcadre });
  /* Every open vacancy (no limit) — feeds the subcadre and department pickers,
     since there is no public subcadre endpoint. */
  const allOpen = useVacancies({});

  const list = useMemo(() => (Array.isArray(query.data?.data) ? query.data.data : []), [query.data]);
  const total = Number(query.data?.total ?? list.length) || 0;
  const pages = Math.max(1, Number(query.data?.pages) || Math.ceil(total / LIMIT) || 1);

  const { subcadreOptions, departmentOptions } = useMemo(() => {
    const source = [...(Array.isArray(allOpen.data?.data) ? allOpen.data.data : []), ...list];
    const subs = new Map();
    const depts = new Set();
    source.forEach((job) => {
      const id = subcadreId(job?.subcadre);
      const name = subcadreName(job?.subcadre);
      if (id && name) subs.set(String(id), name);
      if (job?.department) depts.add(job.department);
    });
    if (subcadre && !subs.has(subcadre)) subs.set(subcadre, 'Selected sub-cadre');
    return {
      subcadreOptions: [...subs].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      departmentOptions: [...depts].sort((a, b) => a.localeCompare(b)),
    };
  }, [allOpen.data, list, subcadre]);

  const hasFilters = Boolean(search || cadre !== DEFAULT_CADRE || department || subcadre);
  const showSubcadre = !isAcademic && subcadreOptions.length > 0;

  let body;
  if (query.isLoading) {
    body = (
      <div className="cr-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <VacancyCardSkeleton key={i} />
        ))}
      </div>
    );
  } else if (query.isError && !query.data) {
    body = (
      <StateCard
        icon={TriangleAlert}
        tone="danger"
        title="We couldn't load vacancies"
        actions={
          <button type="button" className="lp-btn lp-btn-teal" onClick={() => query.refetch()}>
            <RefreshCw size={16} /> Try again
          </button>
        }
      >
        <p>{errorMessage(query.error, 'Please check your connection and try again.')}</p>
      </StateCard>
    );
  } else if (list.length === 0) {
    body = (
      <StateCard
        icon={SearchX}
        title={hasFilters ? 'No vacancies match your filters' : 'No open vacancies right now'}
        actions={
          hasFilters || page > 1 ? (
            <button type="button" className="lp-btn lp-btn-teal" onClick={resetFilters}>
              <RotateCcw size={16} /> Reset filters
            </button>
          ) : null
        }
      >
        <p>
          {hasFilters
            ? 'Try a different keyword, or clear the filters to see every open role.'
            : 'New roles are published regularly — please check back soon.'}
        </p>
      </StateCard>
    );
  } else {
    body = (
      <>
        <div className={`cr-grid${query.isPlaceholderData ? ' is-stale' : ''}`}>
          {list.map((job) => (
            <VacancyCard key={job._id ?? job.id} job={job} />
          ))}
        </div>
        <Pagination
          page={page}
          pages={pages}
          total={total}
          onChange={goToPage}
          disabled={query.isFetching}
        />
      </>
    );
  }

  return (
    <PublicLayout
      eyebrow="Careers"
      title="Open Vacancies"
      subtitle="Find a role that fits you and apply online in minutes — no account needed."
    >
      <section className="cr-page">
        <div className="lp-container cr-container">
          <form className="cr-filters" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="cr-filter cr-filter--search">
              <span className="pub-sr-only">Search vacancies</span>
              <div className="lp-input-wrap">
                <Search size={16} className="lp-input-icon" />
                <input
                  type="search"
                  placeholder="Search by job title…"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    debounced('search', e.target.value);
                  }}
                />
              </div>
            </label>

            <label className="cr-filter">
              <span className="pub-sr-only">Cadre</span>
              <div className="lp-input-wrap plain">
                <select
                  value={cadre}
                  onChange={(e) => {
                    // Departments belong to Academic roles, sub-cadres to Non-Academic ones
                    clearTimeout(timers.current.department);
                    setDeptText('');
                    update({
                      cadre: e.target.value === DEFAULT_CADRE ? '' : e.target.value,
                      department: '',
                      subcadre: '',
                    });
                  }}
                >
                  {CADRES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {isAcademic && (
              <label className="cr-filter">
                <span className="pub-sr-only">Department</span>
                <div className="lp-input-wrap">
                  <Building2 size={16} className="lp-input-icon" />
                  <input
                    type="text"
                    placeholder="Department"
                    list="cr-departments"
                    value={deptText}
                    onChange={(e) => {
                      setDeptText(e.target.value);
                      debounced('department', e.target.value);
                    }}
                  />
                  <datalist id="cr-departments">
                    {departmentOptions.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </label>
            )}

            {showSubcadre && (
              <label className="cr-filter">
                <span className="pub-sr-only">Sub-cadre</span>
                <div className="lp-input-wrap plain">
                  <select value={subcadre} onChange={(e) => update({ subcadre: e.target.value })}>
                    <option value="">All sub-cadres</option>
                    {subcadreOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            )}

            {hasFilters && (
              <button type="button" className="cr-reset" onClick={resetFilters}>
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </form>

          <div id="cr-results" className="cr-results-head">
            <h2>
              {query.isLoading
                ? 'Loading vacancies…'
                : query.isError && !query.data
                  ? 'Vacancies'
                  : `${total} open ${total === 1 ? 'vacancy' : 'vacancies'}`}
            </h2>
            {query.isFetching && !query.isLoading && (
              <span className="cr-updating">
                <RefreshCw size={13} className="lp-spin" /> Updating…
              </span>
            )}
          </div>

          {body}
        </div>
      </section>
    </PublicLayout>
  );
}

export default Vacancies;
