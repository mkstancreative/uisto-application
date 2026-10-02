/* Mirrors the server policy so users see problems before submitting. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordChecks = (password = '') =>
  PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) }));

export const isStrongPassword = (password = '') =>
  PASSWORD_RULES.every((r) => r.test(password));
