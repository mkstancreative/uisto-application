import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateSemester,
  useUpdateSemester,
} from '../../../hooks/useSemesters';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function SemesterMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name ?? '');

  const { mutate: createSemester, isPending: creating } = useCreateSemester();
  const { mutate: updateSemester, isPending: updating } = useUpdateSemester();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateSemester(payload, {
        onSuccess: () => {
          toast.success('Semester updated');
          closeModal();
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Failed to update semester');
          closeModal();
        },
      });
    } else {
      createSemester(
        { name },
        {
          onSuccess: () => {
            toast.success('Semester created');
            closeModal();
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Failed to create semester');
            closeModal();
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Semester' : 'Create Semester'}
      subtitle="Define a semester period (e.g. First Semester, Second Semester)."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="semester-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Semester'
            ) : (
              'Create Semester'
            )}
          </button>
        </>
      }
    >
      <form id="semester-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">Semester Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. First Semester"
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

export default SemesterMutate;
