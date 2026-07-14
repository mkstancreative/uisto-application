import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateProgramme,
  useUpdateProgramme,
} from '../../../hooks/useProgrammes';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function ProgrammeMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name || '');

  const { mutate: createProgramme, isPending: creating } = useCreateProgramme();
  const { mutate: updateProgramme, isPending: updating } = useUpdateProgramme();

  const isPending = creating || updating;

  /* Prefill when editing */

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateProgramme(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Programme updated successfully');
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || 'Failed to update programme',
          );
        },
      });
    } else {
      createProgramme(
        { name },
        {
          onSuccess: () => {
            closeModal();
            toast.success('Programme created successfully');
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || 'Failed to create programme',
            );
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Programme' : 'Create Programme'}
      subtitle="Add or update a programme offered by the institution."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="programme-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Programme'
            ) : (
              'Create Programme'
            )}
          </button>
        </>
      }
    >
      <form id="programme-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">Programme Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. BSc. Computer Science"
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

export default ProgrammeMutate;
