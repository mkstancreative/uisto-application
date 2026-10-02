import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Mail, MailCheck } from 'lucide-react';
import { useForgotPassword } from '../../hooks/useAccount';
import { errorMessage } from '../../api/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { mutate, isPending, isSuccess, data } = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!EMAIL_RE.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    mutate({ email: email.trim() }, { onError: (err) => setFormError(errorMessage(err)) });
  };

  if (isSuccess) {
    return (
      <div className="lp-login-form lp-forgot-done">
        <span className="lp-forgot-icon">
          <MailCheck size={26} />
        </span>
        <p>
          {data?.message ??
            'If that email belongs to a staff account, a reset link has been sent.'}
        </p>
        <p className="lp-muted">The link expires in 30 minutes and can only be used once.</p>
        <button type="button" className="lp-btn lp-btn-teal lp-login-submit" onClick={onBack}>
          <ArrowLeft size={16} /> Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form className="lp-login-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="lp-form-alert" role="alert">
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      <label className="lp-field">
        <span>Staff email</span>
        <div className="lp-input-wrap">
          <Mail size={16} className="lp-input-icon" />
          <input
            type="email"
            placeholder="you@uisto.edu.ng"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
      </label>

      <button type="submit" className="lp-btn lp-btn-lime lp-login-submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={16} className="lp-spin" /> Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </button>

      <button type="button" className="lp-link-btn lp-back-link" onClick={onBack}>
        <ArrowLeft size={14} /> Back to sign in
      </button>
    </form>
  );
}

export default ForgotPasswordForm;
