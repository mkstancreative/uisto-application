import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, Eye, EyeOff, KeyRound, Link2Off, Loader2, Lock, LogIn, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicLayout from '../../../components/public/PublicLayout';
import { useResetPassword } from '../../../hooks/useAccount';
import { errorMessage } from '../../../api/api';
import { isStrongPassword, passwordChecks } from '../../../utils/password';
import StateCard from '../shared/StateCard';
import './reset.css';

/** 400 "Reset link is invalid or has expired" — as opposed to a password-policy 400. */
const isDeadLink = (err) =>
  err?.status === 400 && !err?.data?.requirements?.length && /invalid|expired|used/i.test(err?.message ?? '');

function PasswordInput({ id, label, value, onChange, show, onToggle, autoComplete, error, disabled }) {
  return (
    <div className={`lp-field${error ? ' invalid' : ''}`}>
      <label className="pub-label" htmlFor={id}>
        {label}
      </label>
      <div className="lp-input-wrap">
        <Lock size={16} className="lp-input-icon" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
        />
        <button
          type="button"
          className="lp-password-toggle"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="pub-field-error">{error}</span>}
    </div>
  );
}

function ResetPassword() {
  const { token: pathToken } = useParams();
  const [params] = useSearchParams();
  const token = (pathToken ?? params.get('token') ?? '').trim();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [deadLink, setDeadLink] = useState(false);
  const reset = useResetPassword();

  const checks = passwordChecks(password);
  const openLogin = () => navigate('/', { state: { openLogin: true } });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!isStrongPassword(password)) errs.password = 'Your new password does not meet all the requirements.';
    if (!confirm) errs.confirm = 'Re-enter your new password.';
    else if (confirm !== password) errs.confirm = 'The passwords do not match.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;

    reset.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          setPassword('');
          setConfirm('');
          toast.success('Password reset. You can now sign in.');
        },
        onError: (err) => {
          if (isDeadLink(err)) {
            setDeadLink(true);
            return;
          }
          const msg = errorMessage(err, 'We could not reset your password. Please try again.');
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  let content;
  if (!token || deadLink) {
    content = (
      <StateCard
        icon={Link2Off}
        tone="danger"
        title={token ? 'This reset link is invalid or has expired' : 'Reset link missing'}
        actions={
          <button type="button" className="lp-btn lp-btn-teal" onClick={openLogin}>
            <KeyRound size={16} /> Request a new link
          </button>
        }
      >
        <p>
          {token
            ? 'Password reset links expire after 30 minutes and can only be used once.'
            : 'Open the full link from your password-reset email, or request a new one.'}{' '}
          Choose <strong>Forgot password?</strong> in the sign-in window to get a new link.
        </p>
      </StateCard>
    );
  } else if (reset.isSuccess) {
    content = (
      <StateCard
        icon={ShieldCheck}
        tone="success"
        title="Your password has been reset"
        actions={
          <button type="button" className="lp-btn lp-btn-lime lg" onClick={openLogin}>
            <LogIn size={16} /> Sign in
          </button>
        }
      >
        <p>
          {reset.data?.message ?? 'Password reset. You can now sign in.'} For your security, you have
          been signed out of every device — sign in again with your new password.
        </p>
      </StateCard>
    );
  } else {
    content = (
      <form className="rp-card pub-panel" onSubmit={handleSubmit} noValidate>
        <div className="rp-head">
          <span className="rp-icon">
            <KeyRound size={22} />
          </span>
          <div>
            <h2>Choose a new password</h2>
            <p>Resetting your password signs you out of all devices.</p>
          </div>
        </div>

        {formError && (
          <div className="lp-form-alert" role="alert">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <PasswordInput
          id="rp-new"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors((x) => ({ ...x, password: undefined }));
          }}
          show={show}
          onToggle={() => setShow((s) => !s)}
          error={errors.password}
          disabled={reset.isPending}
        />

        <ul className="rp-checks" aria-label="Password requirements">
          {checks.map((c) => (
            <li key={c.id} className={c.ok ? 'ok' : undefined}>
              {c.ok ? <Check size={14} /> : <X size={14} />}
              {c.label}
            </li>
          ))}
        </ul>

        <PasswordInput
          id="rp-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setErrors((x) => ({ ...x, confirm: undefined }));
          }}
          show={show}
          onToggle={() => setShow((s) => !s)}
          error={errors.confirm}
          disabled={reset.isPending}
        />

        <button type="submit" className="lp-btn lp-btn-lime lp-login-submit" disabled={reset.isPending}>
          {reset.isPending ? (
            <>
              <Loader2 size={16} className="lp-spin" /> Resetting…
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>
    );
  }

  return (
    <PublicLayout eyebrow="Staff account" title="Reset your password">
      <section className="rp-page">
        <div className="lp-container rp-container">{content}</div>
      </section>
    </PublicLayout>
  );
}

export default ResetPassword;
