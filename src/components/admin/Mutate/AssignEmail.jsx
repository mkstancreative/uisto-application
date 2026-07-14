import React, { useState } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useUpdateStudentEmail } from '../../../hooks/useStudents';
import { toast } from 'react-toastify';

function AssignEmail({ student, closeModal }) {
  const [emailInput, setEmailInput] = useState('');

  const { mutate: updateEmail, isPending } = useUpdateStudentEmail();
  if (!student) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    updateEmail(
      { student_id: student.id, email: emailInput.trim(), pass: 'student123' },
      {
        onSuccess: () => {
          toast.success(
            `Email assigned to ${student.fname} ${student.lname} successfully!`,
          );
          closeModal();
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Failed to assign email.');
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={true}
      title="Assign Email"
      subtitle={`For: ${student.fname} ${student.lname}`}
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>

          <button
            type="submit"
            form="assign-email-form"
            className="modal-submit"
            disabled={isPending || !emailInput.trim()}
          >
            {isPending ? <Spinner /> : 'Assign Email'}
          </button>
        </>
      }
    >
      <form
        id="assign-email-form"
        className="form-grid"
        onSubmit={handleSubmit}
      >
        <div className="form-group col-1">
          <label className="modal-label">Student Email Address</label>

          <input
            type="email"
            className="modal-input"
            placeholder="e.g. student@university.edu"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            autoFocus
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default AssignEmail;
