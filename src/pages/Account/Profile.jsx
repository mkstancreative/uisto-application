import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  AlertCircle,
  KeyRound,
  LogOut,
  Monitor,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  UserRound,
  XCircle,
} from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal/ConfirmModal';
import Spinner from '../../components/ui/Spinner/Spinner';
import PasswordInput from '../../components/account/PasswordInput';
import PasswordChecklist from '../../components/account/PasswordChecklist';
import RoleTag from '../../components/admin/common/RoleTag';
import { parseUserAgent } from '../../components/account/parseUserAgent';
import { validatePasswordChange } from '../../components/account/passwordTools';
import { errorMessage } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import { useRevokeSession, useSessions } from '../../hooks/useAccount';
import { getInitials, roleLabel } from '../../utils/roles';
import { formatDate, formatOnlyDate } from '../../utils/helpers';
import '../../components/ui/CustomModal/CustomModal.css';
import '../../components/admin/view/LecturerView.css';
import '../../components/admin/common/adminCommon.css';
import '../../components/account/account.css';

const MAX_SESSIONS = 5;

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'password', label: 'Change password', icon: KeyRound },
  { id: 'devices', label: 'Signed-in devices', icon: ShieldCheck },
];

function Profile() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const active = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'profile';

  const selectTab = (id) => setParams(id === 'profile' ? {} : { tab: id }, { replace: true });

  /* Arrow keys move between tabs, as in a native tab list */
  const onTabKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active);
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length];
    selectTab(next.id);
    document.getElementById(`acct-tab-${next.id}`)?.focus();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <UserRound size={20} />
          </div>
          <div>
            <h2 className="page-title">My Account</h2>
            <p className="page-sub">Your profile, password and signed-in devices.</p>
          </div>
        </div>
      </div>

      <div className="acct-tabs" role="tablist" aria-label="Account sections" onKeyDown={onTabKeyDown}>
        {TABS.map(({ id, label, icon }) => {
          const Icon = icon;
          return (
            <button
              key={id}
              id={`acct-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={active === id}
              aria-controls={`acct-panel-${id}`}
              tabIndex={active === id ? 0 : -1}
              className={`acct-tab${active === id ? ' active' : ''}`}
              onClick={() => selectTab(id)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`acct-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`acct-tab-${active}`}
        className="acct-panel"
      >
        {active === 'profile' && <ProfileCard key={user?.id} user={user} />}
        {active === 'password' && <PasswordCard />}
        {active === 'devices' && (
          <>
            <SessionsCard />
            <SignOutEverywhereCard />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Profile ── */
function ProfileCard({ user }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '', department: user?.department ?? '' });
  const [error, setError] = useState('');
  const { mutate, isPending } = useMutation({ mutationFn: updateProfile });

  const dirty =
    form.name.trim() !== (user?.name ?? '') || form.department.trim() !== (user?.department ?? '');

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Your name cannot be empty.');
      return;
    }
    mutate(
      { name: form.name.trim(), department: form.department.trim() },
      {
        onSuccess: (res) => toast.success(res?.message || 'Profile updated.'),
        onError: (err) => {
          const msg = errorMessage(err, 'Could not update your profile.');
          setError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <section className="lv-card acct-card">
      <div className="lv-card-head">
        <UserRound size={14} /> Profile
      </div>

      <div className="acct-identity">
        <div className="acct-avatar" aria-hidden>
          {getInitials(user?.name)}
        </div>
        <div className="acct-identity-text">
          <span className="acct-name">{user?.name || 'Staff member'}</span>
          <span className="acct-email">{user?.email}</span>
          <span>
            <RoleTag role={user?.role} />
          </span>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
        <div className="form-group col-2">
          <label className="modal-label" htmlFor="profile-name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="profile-name"
            className="modal-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="name"
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label" htmlFor="profile-dept">
            Department
          </label>
          <input
            id="profile-dept"
            className="modal-input"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            autoComplete="organization-title"
          />
        </div>
        <div className="acct-actions" style={{ width: '100%', marginTop: 0 }}>
          <button type="submit" className="modal-submit" disabled={isPending || !dirty}>
            {isPending ? <Spinner text="Saving" /> : 'Save Profile'}
          </button>
        </div>
      </form>

      <div className="lv-rows acct-section-gap">
        <Row label="Email" value={user?.email} />
        <Row label="Role" value={roleLabel(user?.role)} />
        <Row label="Last sign-in" value={user?.lastLogin ? formatDate(user.lastLogin) : '—'} />
        <Row label="Member since" value={user?.createdAt ? formatOnlyDate(user.createdAt) : '—'} />
      </div>
      <p className="acct-note" style={{ margin: '12px 0 0' }}>
        Your email and role can only be changed by an HR manager.
      </p>
    </section>
  );
}

/* ── Change password ── */
const EMPTY_PW = { current: '', next: '', confirm: '' };

function PasswordCard() {
  const { changePassword } = useAuth();
  const qc = useQueryClient();
  const [pw, setPw] = useState(EMPTY_PW);
  const [error, setError] = useState('');
  const { mutate, isPending } = useMutation({ mutationFn: changePassword });

  const set = (key) => (value) => setPw((p) => ({ ...p, [key]: value }));
  const canSubmit = !validatePasswordChange(pw);

  const onSubmit = (e) => {
    e.preventDefault();
    const problem = validatePasswordChange(pw);
    setError(problem);
    if (problem) return;

    mutate(
      { currentPassword: pw.current, newPassword: pw.next },
      {
        onSuccess: (res) => {
          setPw(EMPTY_PW);
          qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
          toast.success(res?.message || 'Password changed. Other devices have been signed out.');
        },
        onError: (err) => {
          const msg = errorMessage(err, 'Could not change your password.');
          setError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <section className="lv-card acct-card">
      <div className="lv-card-head">
        <KeyRound size={14} /> Change password
      </div>
      <p className="acct-note">
        Changing your password signs you out on every other device. This device stays signed in.
      </p>

      <form className="form-grid" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
        <PasswordInput
          label="Current password"
          value={pw.current}
          onChange={set('current')}
          autoComplete="current-password"
          disabled={isPending}
          required
        />
        <PasswordInput
          label="New password"
          value={pw.next}
          onChange={set('next')}
          className="col-2"
          disabled={isPending}
          required
        />
        <PasswordInput
          label="Confirm new password"
          value={pw.confirm}
          onChange={set('confirm')}
          className="col-2"
          disabled={isPending}
          required
        />
        <div className="form-group col-12">
          <PasswordChecklist password={pw.next} confirm={pw.confirm} />
        </div>
        <div className="acct-actions" style={{ width: '100%', marginTop: 0 }}>
          <button type="submit" className="modal-submit" disabled={isPending || !canSubmit}>
            {isPending ? <Spinner text="Updating" /> : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ── Active sessions ── */
const DEVICE_ICON = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

function SessionsCard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSessions();
  const { mutate: revoke, isPending } = useRevokeSession();
  const [target, setTarget] = useState(null);

  const sessions = [...(data?.data ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
  );

  const confirmRevoke = () => {
    if (!target) return;
    revoke(target.id, {
      onSuccess: (res) => {
        toast.success(res?.message || 'Session revoked.');
        setTarget(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not revoke the session.'));
        setTarget(null);
      },
    });
  };

  return (
    <section className="lv-card acct-card">
      <div className="lv-card-head acct-card-head">
        <span>
          <ShieldCheck size={14} /> Active sessions
          {!isLoading && !isError && ` (${data?.count ?? sessions.length}/${MAX_SESSIONS})`}
        </span>
        <button
          type="button"
          className="pw-action-btn"
          style={{ height: 30, padding: '0 10px' }}
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh sessions"
        >
          <RotateCw size={13} /> Refresh
        </button>
      </div>
      <p className="acct-note">
        Each sign-in creates a session that lasts up to 7 days. You can hold up to {MAX_SESSIONS} at once —
        signing in on another device drops the oldest. The list doesn&apos;t mark which session is this
        device; revoking this device&apos;s session signs you out here at the next token refresh.
      </p>

      {isLoading ? (
        <div className="acct-empty">
          <Spinner color="currentColor" text="Loading sessions" />
        </div>
      ) : isError ? (
        <div className="form-alert" role="alert">
          <AlertCircle size={15} />
          <span>
            {errorMessage(error, 'Could not load your sessions.')}{' '}
            <button type="button" className="pw-action-btn" style={{ height: 26, marginLeft: 6 }} onClick={() => refetch()}>
              Try again
            </button>
          </span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="acct-empty">No active sessions found.</div>
      ) : (
        <ul className="acct-sessions">
          {sessions.map((s) => {
            const ua = parseUserAgent(s.userAgent);
            const Icon = DEVICE_ICON[ua.device] ?? Monitor;
            return (
              <li key={s.id} className="acct-session">
                <span className="acct-session-icon">
                  <Icon size={18} />
                </span>
                <div className="acct-session-info">
                  <span className="acct-session-title" title={s.userAgent}>
                    {ua.label}
                  </span>
                  <span className="acct-session-meta">
                    {s.ip ? `IP ${s.ip} · ` : ''}Signed in {s.createdAt ? formatDate(s.createdAt) : '—'}
                  </span>
                  <span className="acct-session-meta">
                    Expires {s.expiresAt ? formatDate(s.expiresAt) : '—'}
                  </span>
                </div>
                <button
                  type="button"
                  className="acct-btn-ghost"
                  onClick={() => setTarget(s)}
                  disabled={isPending}
                >
                  <XCircle size={14} /> Revoke
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        isOpen={Boolean(target)}
        variant="danger"
        title="Revoke this session?"
        message={
          target
            ? `${parseUserAgent(target.userAgent).label}${target.ip ? ` (${target.ip})` : ''} will be signed out. If this is the device you're using now, you'll be signed out here when your access token next refreshes.`
            : ''
        }
        confirmText="Revoke"
        cancelText="Cancel"
        isPending={isPending}
        onConfirm={confirmRevoke}
        onCancel={() => setTarget(null)}
      />
    </section>
  );
}

/* ── Sign out everywhere ── */
function SignOutEverywhereCard() {
  const { logoutEverywhere } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const { mutate, isPending } = useMutation({ mutationFn: logoutEverywhere });

  const onConfirm = () =>
    mutate(undefined, {
      onSuccess: () => {
        toast.success('Signed out of all devices.');
        navigate('/', { replace: true });
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'Could not sign out of all devices.'));
        setConfirming(false);
      },
    });

  return (
    <section className="lv-card acct-card acct-danger">
      <div className="lv-card-head">
        <LogOut size={14} /> Sign out everywhere
      </div>
      <div className="acct-danger-row">
        <p>
          Ends every session on every device, including this one. Use this if you signed in on a shared
          computer or think someone else has your password (and change it too).
        </p>
        <button
          type="button"
          className="acct-btn-danger"
          onClick={() => setConfirming(true)}
          disabled={isPending}
        >
          <LogOut size={15} /> Sign out of all devices
        </button>
      </div>

      <ConfirmModal
        isOpen={confirming}
        variant="danger"
        title="Sign out of all devices?"
        message="Every session, including this one, ends immediately. You'll need to sign in again."
        confirmText="Sign out everywhere"
        cancelText="Cancel"
        isPending={isPending}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="lv-row">
      <span className="lv-row-label">{label}</span>
      <span className="lv-row-value">{value ?? '—'}</span>
    </div>
  );
}

export default Profile;
