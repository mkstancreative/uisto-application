import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle, Info } from 'lucide-react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import TempPasswordField from '../../account/TempPasswordField';
import PasswordReveal from '../../account/PasswordReveal';
import { generatePassword } from '../../account/passwordTools';
import { useResetStaffPassword } from '../../../hooks/useStaff';
import { errorMessage } from '../../../api/api';
import '../common/adminCommon.css';

const MIN_LENGTH = 8;

/** HR manager sets a temporary password for a locked-out or forgetful user. */
function StaffPasswordReset({ user, closeModal }) {
  const { mutate: reset, isPending } = useResetStaffPassword();
  const [password, setPassword] = useState(() => generatePassword());
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(null);

  const id = user?.id ?? user?._id;

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (password.length < MIN_LENGTH) {
      setFormError(`The temporary password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    reset(
      { id, temporaryPassword: password },
      {
        onSuccess: (res) => {
          toast.success(res?.message || 'Temporary password set.');
          setDone(password);
        },
        onError: (err) => {
          const msg = errorMessage(err, 'Could not reset the password.');
          setFormError(msg);
          toast.error(msg);
        },
      },
    );
  };

  if (done) {
    return (
      <CustomModal
        isOpen
        title="Temporary Password Set"
        subtitle={user?.name}
        onClose={closeModal}
        footer={
          <button type="button" className="modal-submit" onClick={closeModal}>
            Done
          </button>
        }
      >
        <PasswordReveal name={user?.name} email={user?.email} password={done}>
          <div className="form-alert info">
            <Info size={15} />
            <span>
              {user?.name ?? 'The user'} has been signed out everywhere, any lock on the account has been
              cleared, and they will be asked to choose a new password at next sign-in.
            </span>
          </div>
        </PasswordReveal>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen
      title="Reset Password"
      subtitle={user ? `${user.name} · ${user.email}` : undefined}
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="staff-reset-form"
            className="modal-submit"
            disabled={isPending || password.length < MIN_LENGTH}
          >
            {isPending ? <Spinner text="Resetting" /> : 'Set Temporary Password'}
          </button>
        </>
      }
    >
      <form id="staff-reset-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-alert warn">
          <Info size={15} />
          <span>
            Their current password stops working immediately and all of their sessions are signed out. They
            must replace this temporary password at next sign-in.
          </span>
        </div>

        <TempPasswordField value={password} onChange={setPassword} disabled={isPending} />
      </form>
    </CustomModal>
  );
}

export default StaffPasswordReset;
