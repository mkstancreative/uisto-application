import { useMemo, useState } from 'react';
import './GeneralTable.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function GeneralTable({
  columns = [],
  data = [],
  loading = false,
  // --- server-side props (pass these when using server pagination) ---
  meta = null, // { page, pages, count, limit, hasPrev, hasNext }
  onPageChange = null, // (page: number) => void
  onLimitChange = null, // (limit: number) => void
  rowProps = () => ({}), // --- custom row props function ---
}) {
  // ── CLIENT-SIDE state (only used when meta is null) ──────────────────────
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  const getValue = (obj, path) => {
    if (!path) return undefined;
    return path.split('.').reduce((o, key) => o?.[key], obj);
  };

  // ── Derive all display values from either meta (server) or local state ───
  const isServer = Boolean(meta);
  const currentPage = isServer ? meta.page : clientPage;
  const totalPages = isServer
    ? meta.pages
    : Math.max(1, Math.ceil(data.length / clientPageSize));
  const totalCount = isServer ? meta.count : data.length;
  const hasPrev = isServer ? meta.hasPrev : clientPage > 1;
  const hasNext = isServer ? meta.hasNext : clientPage < totalPages;
  const limit = isServer ? meta.limit : clientPageSize;

  const displayData = isServer
    ? data // server already sliced — use as-is
    : data.slice(
        (clientPage - 1) * clientPageSize,
        clientPage * clientPageSize,
      );

  const displayStart = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const displayEnd =
    totalCount === 0 ? 0 : displayStart - 1 + displayData.length;

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (p) => {
    if (p < 1 || p > totalPages) return; // guard out-of-range clicks
    if (isServer) {
      if (onPageChange) onPageChange(p);
    } else {
      setClientPage(p);
    }
  };

  // ── Smart page number list: always show first, last, ±2 around current ───
  const pageNums = useMemo(() => {
    const nums = new Set([1, totalPages]);
    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      nums.add(i);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const result = [];
    let prev = null;
    for (const n of sorted) {
      if (prev !== null && n - prev > 1) result.push('…');
      result.push(n);
      prev = n;
    }
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="general-table-wrapper">
      {/* ── Table ── */}
      <div className="general-table">
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-state">
                  <span className="table-empty-icon">📭</span>
                  <span>No records found</span>
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => (
                <tr key={rowIndex} {...rowProps(row, rowIndex)}>
                  {columns.map((col, colIndex) => {
                    const value = getValue(row, col.accessor);
                    return (
                      <td key={colIndex}>
                        {col.render
                          ? col.render(row, rowIndex) // ✅ Fixed: pass raw rowIndex, not pre-offset
                          : value && typeof value === 'object'
                            ? (value.name ?? '—')
                            : (value ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer (hidden while loading or empty) ── */}
      {!loading && totalCount > 0 && (
        <div className="table-footer">
          {/* Count */}
          <span className="table-count">
            Showing {displayStart}–{displayEnd} of {totalCount}
          </span>

          {/* Page buttons */}
          <div className="table-pagination">
            <button
              className="page-btn"
              onClick={() => goTo(currentPage - 1)}
              disabled={!hasPrev}
            >
              ‹
            </button>

            {pageNums.map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="page-gap">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  className={`page-btn ${n === currentPage ? 'active' : ''}`}
                  onClick={() => goTo(n)}
                >
                  {n}
                </button>
              ),
            )}

            <button
              className="page-btn"
              onClick={() => goTo(currentPage + 1)}
              disabled={!hasNext}
            >
              ›
            </button>
          </div>

          {/* Page size selector */}
          <select
            className="page-size-select"
            value={limit}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isServer) {
                if (onLimitChange) onLimitChange(val);
              } else {
                setClientPageSize(val);
                setClientPage(1);
              }
            }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default GeneralTable;
