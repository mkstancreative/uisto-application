import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateLevel, useUpdateLevel } from '../../../hooks/useLevels';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function LevelMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name ?? '');

  const { mutate: createLevel, isPending: creating } = useCreateLevel();
  const { mutate: updateLevel, isPending: updating } = useUpdateLevel();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateLevel(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Level updated successfully');
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || 'Failed to update level',
          );
        },
      });
    } else {
      createLevel(
        { name },
        {
          onSuccess: () => {
            closeModal();
            toast.success('Level created successfully');
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || 'Failed to create level',
            );
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Level' : 'Create Level'}
      subtitle="Define an academic level (e.g. 100 Level, 200 Level)."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="level-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Level' : 'Create Level'}
          </button>
        </>
      }
    >
      <form id="level-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">Level Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. 100 LEVEL"
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

export default LevelMutate;
