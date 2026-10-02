import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import { CADRES, useCreateRequirement, useUpdateRequirement } from '../../../hooks/useConfig';
import { errorMessage } from '../../../api/api';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import '../common/adminCommon.css';

function JobRequirementMutate({ data, closeModal }) {
  const id = data?._id || data?.id;
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: data?.name || '',
    cadre: data?.cadre || '',
  });
  const [formError, setFormError] = useState('');

  const { mutate: createRequirement, isPending: creating } = useCreateRequirement();
  const { mutate: updateRequirement, isPending: updating } = useUpdateRequirement();
  const isPending = creating || updating;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const canSubmit = form.name.trim() && form.cadre;

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!canSubmit) {
      setFormError('Enter a name and choose a cadre.');
      return;
    }

    const payload = { name: form.name.trim(), cadre: form.cadre };
    const handlers = {
      onSuccess: (res) => {
        toast.success(res?.message || (isEdit ? 'Requirement updated.' : 'Requirement created.'));
        closeModal();
      },
      onError: (err) => {
        const msg =
          err?.status === 409
            ? `"${payload.name}" already exists for the ${payload.cadre} cadre.`
            : errorMessage(err, isEdit ? 'Could not update the requirement.' : 'Could not create the requirement.');
        setFormError(msg);
        toast.error(msg);
      },
    };

    if (isEdit) updateRequirement({ id, ...payload }, handlers);
    else createRequirement(payload, handlers);
  };

  const cadreChanged = isEdit && data?.cadre && form.cadre !== data.cadre;

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Edit Requirement' : 'Add Requirement'}
      subtitle="A single criterion applicants must meet, scoped to a cadre."
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
            disabled={isPending || !canSubmit}
          >
            {isPending ? <Spinner text="Saving" /> : isEdit ? 'Save Changes' : 'Create Requirement'}
          </button>
        </>
      }
    >
      <form id="job-requirement-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="req-name">
            Requirement <span className="req">*</span>
          </label>
          <input
            id="req-name"
            type="text"
            className="modal-input"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. PhD in a relevant field"
            required
            autoFocus
          />
        </div>

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="req-cadre">
            Cadre <span className="req">*</span>
          </label>
          <select
            id="req-cadre"
            className="modal-input"
            value={form.cadre}
            onChange={set('cadre')}
            required
          >
            <option value="">Select cadre</option>
            {CADRES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {cadreChanged && (
            <span className="form-hint">
              Positions in the {data.cadre} cadre that already use this requirement keep it, but it will
              no longer be offered for new {data.cadre} positions or vacancies.
            </span>
          )}
        </div>
      </form>
    </CustomModal>
  );
}

export default JobRequirementMutate;
