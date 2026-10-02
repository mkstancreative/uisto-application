/** Drop empty filters so they never reach the query string. */
export const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined,
    ),
  );
