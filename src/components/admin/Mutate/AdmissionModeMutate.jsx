import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateAdmissionMode,
  useUpdateAdmissionMode,
} from '../../../hooks/useAdmissionMode';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function AdmissionModeMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name);

  const { mutate: createMode, isPending: creating } = useCreateAdmissionMode();
  const { mutate: updateMode, isPending: updating } = useUpdateAdmissionMode();

  const isPending = creating || updating;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateMode(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Admission mode updated successfully');
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || 'Failed to update admission mode',
          );
        },
      });
    } else {
      createMode(
        { name },
        {
          onSuccess: () => {
            closeModal();
            toast.success('Admission mode created successfully');
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message ||
                'Failed to create admission mode',
            );
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Admission Mode' : 'Create Admission Mode'}
      subtitle="Define how students gain admission (e.g. UTME, Direct Entry)"
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>

          {/* Important: link button to form */}
          <button
            type="submit"
            form="admission-mode-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Mode' : 'Create Mode'}
          </button>
        </>
      }
    >
      <form
        id="admission-mode-form"
        className="form-grid"
        onSubmit={handleSubmit}
      >
        <div className="form-group col-1">
          <label className="modal-label">Mode Name</label>

          <input
            type="text"
            className="modal-input"
            placeholder="e.g. UTME, DIRECT ENTRY"
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

export default AdmissionModeMutate;
