import { useId, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import './account.css';

/**
 * Password field with a show/hide toggle.
 *  variant="admin"  → modal-input styling (admin pages, follows dark/light mode)
 *  variant="public" → lp-input-wrap styling (white card on the standalone pages)
 * `actions` renders beside the input (e.g. Generate / Copy buttons);
 * `children` renders underneath (e.g. a PasswordChecklist).
 */
function PasswordInput({
  label,
  value,
  onChange,
  variant = 'admin',
  className = 'col-12',
  name,
  autoComplete = 'new-password',
  placeholder,
  disabled = false,
  required = false,
  autoFocus = false,
  initiallyVisible = false,
  actions,
  children,
}) {
  const id = useId();
  const [visible, setVisible] = useState(initiallyVisible);

  const toggle = (
    <button
      type="button"
      className={variant === 'public' ? 'lp-password-toggle' : 'pw-toggle'}
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const input = (
    <input
      id={id}
      name={name}
      type={visible ? 'text' : 'password'}
      className={variant === 'public' ? undefined : 'modal-input pw-input'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      spellCheck={false}
      autoCapitalize="off"
    />
  );

  if (variant === 'public') {
    return (
      <div className="pw-public">
        <div className="lp-field">
          <label htmlFor={id}>{label}</label>
          <div className="lp-input-wrap">
            <Lock size={16} className="lp-input-icon" />
            {input}
            {toggle}
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`form-group ${className}`}>
      <label className="modal-label" htmlFor={id}>
        {label} {required && <span className="req">*</span>}
      </label>
      <div className="pw-row">
        <div className="pw-wrap">
          {input}
          {toggle}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export default PasswordInput;
