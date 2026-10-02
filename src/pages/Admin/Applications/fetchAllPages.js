import { toTableMeta } from '../../../utils/pagination';

export const EXPORT_PAGE_SIZE = 100;
export const EXPORT_ROW_CAP = 5000;

/**
 * Page through a list endpoint until every row is loaded (or the cap is hit).
 * `fetchPage({ page, limit })` must resolve to the raw response body.
 */
export async function fetchAllPages(
  fetchPage,
  { limit = EXPORT_PAGE_SIZE, cap = EXPORT_ROW_CAP, onProgress } = {},
) {
  const rows = [];
  let page = 1;
  let total = 0;

  while (rows.length < cap) {
    const res = await fetchPage({ page, limit });
    const data = Array.isArray(res?.data) ? res.data : [];
    const meta = toTableMeta(res, { page, limit });
    total = Math.max(meta?.count ?? 0, rows.length + data.length);
    rows.push(...data);
    onProgress?.(Math.min(rows.length, cap), Math.min(total, cap));
    if (!data.length || page >= (meta?.pages ?? 1)) break;
    page += 1;
  }

  return { rows: rows.slice(0, cap), total, truncated: total > cap };
}
