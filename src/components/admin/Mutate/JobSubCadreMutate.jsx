import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateSubCadre, useUpdateSubCadre } from '../../../hooks/useJobs';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function JobSubCadreMutate({ data = {}, closeModal }) {
  const isEdit = Boolean(data?._id || data?.id);
  const idToUpdate = data?._id || data?.id;

  const [form, setForm] = useState({
    name: data?.name || '',
    cadre_id: data?.cadre_id || '',
    description: data?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const { mutate: create, isPending: creating } = useCreateSubCadre();
  const { mutate: update, isPending: updating } = useUpdateSubCadre();
  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { ...form };

    if (isEdit) {
      payload.id = idToUpdate;
    }

    const mutate = isEdit ? update : create;

    mutate(payload, {
      onSuccess: () => {
        toast.success(
          isEdit
            ? 'Job Sub-Cadre updated successfully'
            : 'Job Sub-Cadre created successfully',
        );
        closeModal();
      },
      onError: (err) => toast.error(err?.message || 'Operation failed'),
    });
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit Job Sub-Cadre' : 'Add New Job Sub-Cadre'}
      subtitle="Fill in the details for this job sub-cadre."
      size="md"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="subcadre-form"
            className="modal-submit"
            disabled={isPending || !form.name || !form.cadre_id}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Sub-Cadre'
            )}
          </button>
        </>
      }
    >
      <form id="subcadre-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-12">
          <label className="modal-label">
            Cadre <span className="req">*</span>
          </label>
          <select
            className="modal-input"
            name="cadre_id"
            value={form.cadre_id}
            onChange={handleChange}
            required
          >
            <option value="">— Select Cadre —</option>
            {/* TODO: Populate with actual cadres */}
            <option value="1">Academic</option>
            <option value="2">Non-Academic</option>
          </select>
        </div>

        <div className="form-group col-12">
          <label className="modal-label">
            Sub-Cadre Name <span className="req">*</span>
          </label>
          <input
            type="text"
            className="modal-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Senior Lecturer"
            required
          />
        </div>

        <div className="form-group col-12">
          <label className="modal-label">Description</label>
          <textarea
            className="modal-input"
            name="description"
            rows={4}
            placeholder="Describe this sub-cadre..."
            value={form.description}
            onChange={handleChange}
            style={{ resize: 'vertical' }}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default JobSubCadreMutate;
