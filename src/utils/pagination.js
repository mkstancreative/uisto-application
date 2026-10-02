/**
 * The API uses three pagination shapes. Normalise any of them into the
 * `meta` object GeneralTable expects: { page, pages, count, limit, hasPrev, hasNext }.
 *
 *  { pagination: { total, page, pages } }            admin applications, shortlist-by-job
 *  { pagination: { total, page, limit, totalPages } } positions, subcadres, shortlist/all
 *  { total, page, pages, data }                      requirements, candidates, jobs, careers, users
 */
export const toTableMeta = (res, { page = 1, limit = 10 } = {}) => {
  if (!res) return null;
  const p = res.pagination ?? {};
  const count = Number(p.total ?? res.totalRecords ?? res.total ?? res.data?.length ?? 0);
  const current = Number(p.page ?? res.page ?? page) || 1;
  const pages =
    Number(p.pages ?? p.totalPages ?? res.pages ?? Math.ceil(count / limit)) || 1;
  return {
    page: current,
    pages: Math.max(1, pages),
    count,
    limit,
    hasPrev: current > 1,
    hasNext: current < pages,
  };
};
