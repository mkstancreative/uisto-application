import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { MdOutlineSecurity } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { errorMessage } from '../../api/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Explain the failure, including when a locked account opens again. */
const loginErrorText = (err) => {
  if (err?.status === 423 && err.data?.lockedUntil) {
    const until = new Date(err.data.lockedUntil).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Too many failed attempts. This account is locked until ${until}.`;
  }
  return errorMessage(err, 'Sign-in failed. Please try again.');
};

function LoginForm({ onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate, isPending } = useMutation({ mutationFn: login });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!EMAIL_RE.test(email.trim()) || !password) {
      setFormError('Enter your staff email address and password.');
      return;
    }

    mutate(
      { email, password },
      {
        onSuccess: (user) => {
          if (user.mustChangePassword) {
            toast.info('Please set a new password to continue.');
            navigate('/change-password', { replace: true });
            return;
          }
          const from = location.state?.from?.pathname;
          toast.success(`Welcome back, ${user.name?.split(' ')[0] ?? 'there'}!`);
          navigate(from?.startsWith('/admin') ? from : '/admin', { replace: true });
        },
        onError: (err) => setFormError(loginErrorText(err)),
      },
    );
  };

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
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
      </label>

      <label className="lp-field">
        <span className="lp-field-row">
          Password
          <button type="button" className="lp-link-btn" onClick={onForgotPassword}>
            Forgot password?
          </button>
        </span>
        <div className="lp-input-wrap">
          <Lock size={16} className="lp-input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          <button
            type="button"
            className="lp-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      <button type="submit" className="lp-btn lp-btn-lime lp-login-submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 size={16} className="lp-spin" />
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="lp-login-footer">
        <MdOutlineSecurity />
        <span>Staff accounts are created by the HR office</span>
      </div>
    </form>
  );
}

export default LoginForm;
