import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AlertCircle, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import PasswordInput from '../../components/account/PasswordInput';
import PasswordChecklist from '../../components/account/PasswordChecklist';
import { validatePasswordChange } from '../../components/account/passwordTools';
import { BRAND_NAME } from '../../components/public/brand';
import { errorMessage } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import '../../components/public/public.css';
import '../../components/account/account.css';

/* First sign-in (or after an HR reset): nothing else opens until the password is changed. */
function ChangePasswordRequired() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const { mutate, isPending } = useMutation({ mutationFn: changePassword });

  const set = (key) => (value) => setPw((p) => ({ ...p, [key]: value }));
  const firstName = user?.name?.split(' ')[0];

  const onSubmit = (e) => {
    e.preventDefault();
    const problem = validatePasswordChange(pw);
    setError(problem);
    if (problem) return;

    mutate(
      { currentPassword: pw.current, newPassword: pw.next },
      {
        onSuccess: () => {
          toast.success(`Password updated${firstName ? ` — welcome, ${firstName}` : ''}!`);
          navigate('/admin', { replace: true });
        },
        onError: (err) => setError(errorMessage(err, 'Could not change your password.')),
      },
    );
  };

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="cpr-page">
      <div className="lp-modal cpr-card" role="dialog" aria-labelledby="cpr-title">
        <div className="lp-modal-head">
          <img src="/logo.png" alt="" className="lp-modal-logo" />
          <h2 id="cpr-title">Set a new password</h2>
          <p>{BRAND_NAME} staff portal</p>
        </div>

        <div className="cpr-note">
          <ShieldCheck size={16} />
          <span>
            {firstName ? `Hi ${firstName}. ` : ''}
            You signed in with a temporary password — either this is your first sign-in or HR reset your
            password. Choose a new password to continue; nothing else in the portal opens until you do.
          </span>
        </div>

        <form className="lp-login-form" onSubmit={onSubmit} noValidate>
          {error && (
            <div className="lp-form-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <PasswordInput
            variant="public"
            label="Temporary password"
            value={pw.current}
            onChange={set('current')}
            autoComplete="current-password"
            placeholder="The password you just signed in with"
            disabled={isPending}
            autoFocus
          />

          <PasswordInput
            variant="public"
            label="New password"
            value={pw.next}
            onChange={set('next')}
            placeholder="Create a strong password"
            disabled={isPending}
          />

          <PasswordInput
            variant="public"
            label="Confirm new password"
            value={pw.confirm}
            onChange={set('confirm')}
            placeholder="Type it again"
            disabled={isPending}
          >
            <PasswordChecklist password={pw.next} confirm={pw.confirm} variant="public" />
          </PasswordInput>

          <button
            type="submit"
            className="lp-btn lp-btn-lime lp-login-submit"
            disabled={isPending || Boolean(validatePasswordChange(pw))}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="lp-spin" />
                Saving…
              </>
            ) : (
              'Save and continue'
            )}
          </button>
        </form>

        <div className="cpr-footer">
          <span>
            Signed in as <strong>{user?.email ?? 'staff member'}</strong>
          </span>
          <button type="button" className="lp-link-btn" onClick={onSignOut} disabled={signingOut}>
            <LogOut size={13} /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default ChangePasswordRequired;
