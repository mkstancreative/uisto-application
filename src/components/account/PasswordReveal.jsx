import { Copy, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { copyToClipboard } from './passwordTools';
import './account.css';
import '../admin/common/adminCommon.css';

/** Shows a temporary password once, with a copy button and a share-it-privately warning. */
function PasswordReveal({ name, email, password, children }) {
  const copy = async (text, what) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(`${what} copied.`);
    else toast.error('Could not copy — select the text and copy it manually.');
  };

  return (
    <div className="pw-reveal">
      {children}

      {email && (
        <div className="form-group">
          <span className="modal-label">Sign-in email{name ? ` for ${name}` : ''}</span>
          <div className="pw-reveal-box" style={{ borderStyle: 'solid' }}>
            <span className="pw-reveal-value" style={{ fontSize: 14, letterSpacing: 0 }}>
              {email}
            </span>
            <button type="button" className="pw-action-btn" onClick={() => copy(email, 'Email')}>
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>
      )}

      <div className="form-group">
        <span className="modal-label">Temporary password</span>
        <div className="pw-reveal-box">
          <span className="pw-reveal-value">{password}</span>
          <button type="button" className="pw-action-btn" onClick={() => copy(password, 'Password')}>
            <Copy size={14} /> Copy
          </button>
        </div>
      </div>

      <div className="form-alert warn">
        <ShieldAlert size={15} />
        <span>
          This is the only time the password is shown — it is never stored in readable form and cannot be
          retrieved later. Share it with the user privately (in person, by phone or another trusted channel),
          not in the same message as their email. They must choose a new password at first sign-in.
        </span>
      </div>
    </div>
  );
}

export default PasswordReveal;
