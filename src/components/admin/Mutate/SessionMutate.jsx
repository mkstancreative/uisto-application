import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateSession, useUpdateSession } from '../../../hooks/useSessions';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function SessionMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name || '');

  const { mutate: createSession, isPending: creating } = useCreateSession();
  const { mutate: updateSession, isPending: updating } = useUpdateSession();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateSession(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Session updated successfully');
        },
      });
    } else {
      createSession(
        { name },
        {
          onSuccess: () => {
            closeModal();
            toast.success('Session created successfully');
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Session' : 'Create Session'}
      subtitle={
        <>
          Format: <strong>YYYY/YYYY</strong> — e.g. 2024/2025
        </>
      }
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="session-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Session'
            ) : (
              'Create Session'
            )}
          </button>
        </>
      }
    >
      <form id="session-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">Session Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. 2024/2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default SessionMutate;
