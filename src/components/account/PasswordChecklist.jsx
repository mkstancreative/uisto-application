import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { passwordChecks } from '../../utils/password';
import './account.css';

/**
 * Live view of the password policy.
 * Pass `confirm` (even an empty string) to add a "passwords match" line.
 */
function PasswordChecklist({ password = '', confirm, variant = 'admin' }) {
  const checks = passwordChecks(password);
  const showMatch = confirm !== undefined;
  const matches = showMatch && confirm.length > 0 && confirm === password;
  const mismatch = showMatch && confirm.length > 0 && confirm !== password;

  return (
    <ul className={`pw-checklist ${variant}`} aria-label="Password requirements">
      {checks.map((c) => (
        <li key={c.id} className={c.ok ? 'ok' : ''}>
          {c.ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {c.label}
        </li>
      ))}
      {showMatch && (
        <li className={matches ? 'ok' : mismatch ? 'bad' : ''}>
          {matches ? <CheckCircle2 size={14} /> : mismatch ? <XCircle size={14} /> : <Circle size={14} />}
          {mismatch ? 'Passwords do not match' : 'Both entries match'}
        </li>
      )}
    </ul>
  );
}

export default PasswordChecklist;
