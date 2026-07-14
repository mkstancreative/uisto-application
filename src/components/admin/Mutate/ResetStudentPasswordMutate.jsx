import React from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useResetStudentPassword } from '../../../hooks/useStudents';
import { toast } from 'react-toastify';
import { ShieldAlert } from 'lucide-react';

function ResetStudentPasswordMutate({ student, closeModal }) {
  const { mutate: resetPassword, isPending } = useResetStudentPassword();
  if (!student) return null;

  const handleReset = () => {
    resetPassword(
      { user_id: String(student.user_id ?? student.id) },
      {
        onSuccess: (res) => {
          toast.success(
            res?.message ||
              `Password reset successfully for ${student.fname} ${student.lname}.`,
          );
          closeModal();
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              'Failed to reset password.',
          );
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={true}
      title="Reset Student Password"
      subtitle={`${student.fname} ${student.lname} — ${student.regno ?? student.email ?? ''}`}
      size="sm"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-submit"
            style={{ background: '#ef4444' }}
            disabled={isPending}
            onClick={handleReset}
          >
            {isPending ? <Spinner /> : 'Reset Password'}
          </button>
        </>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '4px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: '#dc2626',
              lineHeight: 1.5,
            }}
          >
            This will reset the student's password to the system default. The
            student will need to change it upon next login.
          </p>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-secondary, #64748b)',
          }}
        >
          Are you sure you want to reset the password for{' '}
          <strong>
            {student.fname} {student.lname}
          </strong>
          ?
        </p>
      </div>
    </CustomModal>
  );
}

export default ResetStudentPasswordMutate;
