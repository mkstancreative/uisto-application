const pad = (n) => String(n).padStart(2, '0');

/** "YYYY-MM-DD" for a Date in the user's local time zone. */
export const toDateInput = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** End of the chosen local day, as an ISO string for the API. */
export const endOfDayIso = (dateInput) => {
  if (!dateInput) return undefined;
  const d = new Date(`${dateInput}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

/** Whole days until a deadline (negative once it has passed). */
export const daysUntil = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return ms < 0 ? -1 : Math.floor(ms / 86400000);
};

/** Short human description of a deadline: "Expired", "Closes today", "3 days left". */
export const deadlineLabel = (iso) => {
  const days = daysUntil(iso);
  if (days === null) return '';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Closes today';
  return `${days} day${days === 1 ? '' : 's'} left`;
};
