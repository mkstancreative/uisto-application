import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateFaculty,
  useUpdateFaculty,
} from '../../../hooks/useFaculties';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function FacultyMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data.name);

  const { mutate: createFaculty, isPending: creating } = useCreateFaculty();
  const { mutate: updateFaculty, isPending: updating } = useUpdateFaculty();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = { name, id: data?.id };

    if (isEdit) {
      updateFaculty(payload, {
        onSuccess: () => {
          closeModal();
          toast.success('School updated successfully');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    } else {
      createFaculty(
        { name },
        {
          onSuccess: () => {
            closeModal();
            toast.success('School created successfully');
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update School' : 'Create School'}
      subtitle="Add or update a school within the institution."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="faculty-form"
            className="modal-submit"
            disabled={isPending || "" }
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Faculty'
            ) : (
              'Create Faculty'
            )}
          </button>
        </>
      }
    >
      <form id="faculty-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-1">
          <label className="modal-label">School Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="School name"
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

export default FacultyMutate;
