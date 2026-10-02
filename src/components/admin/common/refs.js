/* Reference fields arrive as ids, populated objects or (on jobs) plain names. */

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** String id of an id-or-object reference ('' when missing). */
export const refId = (ref) => {
  if (ref === null || ref === undefined || ref === '') return '';
  if (typeof ref === 'object') return String(ref._id ?? ref.id ?? '');
  return String(ref);
};

/** Builds a resolver: subcadre id | populated subcadre | name → display name. */
export const makeSubcadreName = (subcadres = []) => {
  const byId = new Map(subcadres.map((s) => [refId(s), s.name]));
  return (ref) => {
    if (!ref) return '';
    if (typeof ref === 'object') return ref.name ?? byId.get(refId(ref)) ?? '';
    const name = byId.get(String(ref));
    if (name) return name;
    return OBJECT_ID.test(String(ref)) ? '' : String(ref);
  };
};

/** Unique, sorted department names seen on positions (there is no departments endpoint). */
export const departmentsFrom = (positions = []) =>
  [...new Set(positions.map((p) => p?.department).filter(Boolean).map(String))].sort((a, b) =>
    a.localeCompare(b),
  );
