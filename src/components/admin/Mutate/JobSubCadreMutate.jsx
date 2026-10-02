import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import { useCreateSubcadre, useUpdateSubcadre } from '../../../hooks/useConfig';
import { errorMessage } from '../../../api/api';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import '../common/adminCommon.css';

function JobSubCadreMutate({ data, closeModal }) {
  const id = data?._id || data?.id;
  const isEdit = Boolean(id);

  const [name, setName] = useState(data?.name || '');
  const [formError, setFormError] = useState('');

  const { mutate: create, isPending: creating } = useCreateSubcadre();
  const { mutate: update, isPending: updating } = useUpdateSubcadre();
  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Enter a name.');
      return;
    }

    const handlers = {
      onSuccess: (res) => {
        toast.success(res?.message || (isEdit ? 'Subcadre renamed.' : 'Subcadre created.'));
        closeModal();
      },
      onError: (err) => {
        const msg =
          err?.status === 409
            ? `A subcadre called "${trimmed}" already exists.`
            : errorMessage(err, isEdit ? 'Could not rename the subcadre.' : 'Could not create the subcadre.');
        setFormError(msg);
        toast.error(msg);
      },
    };

    if (isEdit) update({ id, name: trimmed }, handlers);
    else create({ name: trimmed }, handlers);
  };

  return (
    <CustomModal
      isOpen
      title={isEdit ? 'Rename Subcadre' : 'Add Subcadre'}
      subtitle="Subcadres group Non-Academic positions."
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
            disabled={isPending || !name.trim()}
          >
            {isPending ? <Spinner text="Saving" /> : isEdit ? 'Save Changes' : 'Create Subcadre'}
          </button>
        </>
      }
    >
      <form id="subcadre-form" className="form-grid" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <div className="form-group col-12">
          <label className="modal-label" htmlFor="subcadre-name">
            Name <span className="req">*</span>
          </label>
          <input
            id="subcadre-name"
            type="text"
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Administrative Cadre"
            required
            autoFocus
          />
          <span className="form-hint">Names must be unique. Subcadres always belong to the Non-Academic cadre.</span>
        </div>
      </form>
    </CustomModal>
  );
}

export default JobSubCadreMutate;
