import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateElectionPosition,
  useUpdateElectionPosition,
} from '../../../hooks/usePolls';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function ElectionPositionMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);
  const toLocal = (v) => (v ? v.replace(' ', 'T').slice(0, 16) : '');
  const [form, setForm] = useState({
    name: data.name ?? '',
    votingstarts: toLocal(data.votingstarts),
    votingends: toLocal(data.votingends),
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const { mutate: create, isPending: creating } = useCreateElectionPosition();
  const { mutate: update, isPending: updating } = useUpdateElectionPosition();
  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // Convert "2025-07-11T13:30" back to "2025-07-11 13:30:00" for the API
    const toApi = (v) => (v ? v.replace('T', ' ') + ':00' : '');

    const payload = {
      name: form.name.trim(),
      votingstarts: toApi(form.votingstarts),
      votingends: toApi(form.votingends),
    };

    if (isEdit) {
      update(
        { ...payload, id: data.id },
        {
          onSuccess: (res) => {
            toast.success(res?.message ?? 'Position updated.');
            closeModal();
          },
          onError: (err) =>
            toast.error(err?.message ?? 'Failed to update position.'),
        },
      );
    } else {
      create(payload, {
        onSuccess: (res) => {
          toast.success(res?.message ?? 'Position created.');
          closeModal();
        },
        onError: (err) =>
          toast.error(err?.message ?? 'Failed to create position.'),
      });
    }
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit Election Position' : 'New Election Position'}
      subtitle="Set the position name and voting window."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="position-form"
            className="modal-submit"
            disabled={isPending || !form.name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Position'
            )}
          </button>
        </>
      }
    >
      <form id="position-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">Position Name *</label>
          <input
            className="modal-input"
            placeholder="e.g. SUG President"
            value={form.name}
            onChange={set('name')}
            autoFocus
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">Voting Starts</label>
          <input
            type="datetime-local"
            className="modal-input"
            value={form.votingstarts}
            onChange={set('votingstarts')}
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">Voting Ends</label>
          <input
            type="datetime-local"
            className="modal-input"
            value={form.votingends}
            onChange={set('votingends')}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default ElectionPositionMutate;
