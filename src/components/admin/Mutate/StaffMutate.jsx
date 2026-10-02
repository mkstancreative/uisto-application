import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import TempPasswordField from '../../account/TempPasswordField';
import PasswordReveal from '../../account/PasswordReveal';
import { useCreateStaffUser, useUpdateStaffUser } from '../../../hooks/useStaff';
import { errorMessage } from '../../../api/api';
import { isStrongPassword } from '../../../utils/password';
import { ASSIGNABLE_ROLES, roleLabel } from '../../../utils/roles';
import '../common/adminCommon.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_HELP = {
  registrar: 'Reads everything; creates vacancies, generates shortlists, changes application status.',
  hoc: 'Read-only access to every page.',
  viewer: 'Read-only access to every page.',
};

/* Create a staff account, or edit name / department / role of an existing one. */
function StaffMutate({ data, currentUserId, closeModal }) {
  const id = data?.id ?? data?._id;
  if (id) return <StaffEdit user={data} id={id} currentUserId={currentUserId} closeModal={closeModal} />;
  return <StaffCreate closeModal={closeModal} />;
}

/* ════════════════════════ CREATE ════════════════════════ */
function StaffCreate({ closeModal }) {
  const { mutate: create, isPending } = useCreateStaffUser();
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    role: 'viewer',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit =
    form.name.trim() && EMAIL_RE.test(form.email.trim()) && isStrongPassword(form.password);

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim())) {
      setFormError('Enter a name and a valid email address.');
      return;
    }
    if (!isStrongPassword(form.password)) {
      setFormError('The temporary password does not meet the password policy.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.department.trim() || undefined,
      role: form.role,
      password: form.password,
    };

    create(payload, {
      onSuccess: (res) => {
        toast.success(res?.message || 'Staff account created.');
        setCreated({
          name: res?.data?.name ?? payload.name,
          email: res?.data?.email ?? payload.email,
          role: res?.data?.role ?? payload.role,
          password: payload.password,
        });
      },
      onError: (err) => {
        const msg =
          err?.status === 409
            ? `An account with ${payload.email} already exists.`
            : errorMessage(err, 'Could not create the account.');
        setFormError(msg);
        toast.error(msg);
      },
    });
  };

  if (created) {
    return (
      <CustomModal
        isOpen
        title="Account Created"
        subtitle={`${created.name} · ${roleLabel(created.role)}`}
        onClose={closeModal}
        footer={
          <button type="button" className="modal-submit" onClick={closeModal}>
            Done
          </button>
        }
      >
        <PasswordReveal name={created.name} email={created.email} password={created.password}>
          <div className="form-alert info">
            <CheckCircle2 size={15} />
            <span>
              The account is ready. On first sign-in {created.name.split(' ')[0]} will be asked to replace the
              temporary password before anything else opens.
            </span>
          </div>
        </PasswordReveal>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen
      title="Add Staff User"
      subtitle="Create a sign-in for a member of staff."
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="staff-create-form"
            className="modal-submit"
            disabled={isPending || !canSubmit}
          >
            {isPending ? <Spinner text="Creating" /> : 'Create Account'}
          </button>
        </>
      }
    >
      <form id="staff-create-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="staff-name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="staff-name"
            className="modal-input"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Samuel Okoro"
            autoComplete="off"
            required
            autoFocus
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="staff-email">
            Email <span className="req">*</span>
          </label>
          <input
            id="staff-email"
            type="email"
            className="modal-input"
            value={form.email}
            onChange={set('email')}
            placeholder="name@uisto.edu.ng"
            autoComplete="off"
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="staff-dept">
            Department
          </label>
          <input
            id="staff-dept"
            className="modal-input"
            value={form.department}
            onChange={set('department')}
            placeholder="e.g. Registry"
            autoComplete="off"
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label" htmlFor="staff-role">
            Role <span className="req">*</span>
          </label>
          <select id="staff-role" className="modal-input" value={form.role} onChange={set('role')}>
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
          <span className="form-hint">{ROLE_HELP[form.role]}</span>
        </div>

        <TempPasswordField
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          disabled={isPending}
        />

        <div className="form-alert info">
          <Info size={15} />
          <span>
            This is a one-time password. The user must change it at first sign-in — until then no other
            page opens for them. HR manager accounts can only be created on the server.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

/* ════════════════════════ EDIT ════════════════════════ */
function StaffEdit({ user, id, currentUserId, closeModal }) {
  const { mutate: update, isPending } = useUpdateStaffUser();
  const [form, setForm] = useState({
    name: user.name ?? '',
    department: user.department ?? '',
    role: user.role ?? 'viewer',
  });
  const [formError, setFormError] = useState('');

  const isSelf = String(id) === String(currentUserId);
  const isHrm = user.role === 'hrm';
  const roleEditable = !isSelf && !isHrm;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name cannot be empty.');
      return;
    }

    const payload = { id, name: form.name.trim(), department: form.department.trim() };
    // Only send the role when it actually changed — the API rejects any role on your own account
    if (roleEditable && form.role !== user.role) payload.role = form.role;

    update(payload, {
      onSuccess: (res) => {
        toast.success(res?.message || 'User updated.');
        closeModal();
      },
      onError: (err) => {
        const msg = errorMessage(err, 'Could not update the user.');
        setFormError(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <CustomModal
      isOpen
      title="Edit Staff User"
      subtitle={user.email}
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="staff-edit-form"
            className="modal-submit"
            disabled={isPending || !form.name.trim()}
          >
            {isPending ? <Spinner text="Saving" /> : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="staff-edit-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="staff-edit-name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="staff-edit-name"
            className="modal-input"
            value={form.name}
            onChange={set('name')}
            required
            autoFocus
          />
        </div>

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="staff-edit-dept">
            Department
          </label>
          <input
            id="staff-edit-dept"
            className="modal-input"
            value={form.department}
            onChange={set('department')}
          />
        </div>

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="staff-edit-role">
            Role
          </label>
          {roleEditable ? (
            <>
              <select id="staff-edit-role" className="modal-input" value={form.role} onChange={set('role')}>
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
              <span className="form-hint">{ROLE_HELP[form.role]}</span>
            </>
          ) : (
            <>
              <div className="form-readonly">{roleLabel(user.role)}</div>
              <span className="form-hint">
                {isSelf
                  ? 'You cannot change your own role.'
                  : 'HR manager roles are managed on the server and cannot be changed here.'}
              </span>
            </>
          )}
        </div>

        <div className="form-group col-12">
          <span className="modal-label">Email</span>
          <div className="form-readonly">{user.email}</div>
          <span className="form-hint">Email addresses cannot be changed.</span>
        </div>
      </form>
    </CustomModal>
  );
}

export default StaffMutate;
