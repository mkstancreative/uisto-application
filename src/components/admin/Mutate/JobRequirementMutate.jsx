import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateRequirement,
  useUpdateRequirement,
} from '../../../hooks/useJobs';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function JobRequirementMutate({ data, closeModal }) {
  const isEdit = Boolean(data?._id || data?.id);
  const idToUpdate = data?._id || data?.id;

  const [form, setForm] = useState({
    name: data?.name || '',
    cadre: data?.cadre || '',
  });

  const { mutate: createRequirement, isPending: creating } =
    useCreateRequirement();
  const { mutate: updateRequirement, isPending: updating } =
    useUpdateRequirement();
  const isPending = creating || updating;

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      cadre: form.cadre,
    };

    if (isEdit) {
      payload.id = idToUpdate;
      updateRequirement(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Job Requirement updated successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to update Job Requirement');
        },
      });
    } else {
      createRequirement(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('Job Requirement created successfully');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to create Job Requirement');
        },
      });
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Edit Job Requirement' : 'Add Job Requirement'}
      subtitle={
        isEdit ? 'Update requirement details.' : 'Create a new job requirement.'
      }
      size="default"
      placement="center"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="job-requirement-form"
            className="modal-submit"
            disabled={isPending || !form.name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Requirement'
            )}
          </button>
        </>
      }
    >
      <form id="job-requirement-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-12">
          <label className="modal-label">
            Cadre <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            value={form.cadre}
            onChange={set('cadre')}
            required
          >
            <option value="">Select Cadre</option>
            <option value="Academic">Academic</option>
            <option value="Non-Academic">Non-Academic</option>
          </select>
        </div>

        <div className="form-group col-12">
          <label className="modal-label">
            Requirement Name <span className="req">*</span>
          </label>
          <input
            type="text"
            className="modal-input"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Administration"
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default JobRequirementMutate;
