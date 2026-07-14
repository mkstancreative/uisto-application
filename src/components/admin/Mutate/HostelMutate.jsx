import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateHostel, useUpdateHostel } from '../../../hooks/useHostels';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function HostelMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const [name, setName] = useState(data?.name || '');
  const [type, setType] = useState(data?.type || 'Male Hostel');
  const [phone, setPhone] = useState(data?.phone || '');
  const [address, setAddress] = useState(data?.address || '');

  const { mutate: createHostel, isPending: creating } = useCreateHostel();
  const { mutate: updateHostel, isPending: updating } = useUpdateHostel();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { name, type, phone, address, id: data?.id };

    if (isEdit) {
      updateHostel(payload, {
        onSuccess: () => {
          toast.success('Hostel updated successfully.');
          closeModal();
        },
      });
    } else {
      createHostel(
        { name, type, phone, address },
        {
          onSuccess: () => {
            toast.success('Hostel created successfully.');
            closeModal();
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Hostel' : 'Create Hostel'}
      subtitle="Manage hostel details (name, type, contact, and address)."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="hostel-form"
            className="modal-submit"
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <Spinner />
            ) : isEdit ? (
              'Update Hostel'
            ) : (
              'Create Hostel'
            )}
          </button>
        </>
      }
    >
      <form id="hostel-form" className="form-grid" onSubmit={onSubmit}>
        <div className="form-group col-2">
          <label className="modal-label">Hostel Name</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Mkstan PLAZA"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Hostel Type</label>
          <select
            className="modal-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option hidden>Select Hostel Type</option>
            <option value="Male Hostel">Male Hostel</option>
            <option value="Female Hostel">Female Hostel</option>
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Phone</label>
          <input
            type="tel"
            className="modal-input"
            placeholder="e.g. +2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Address</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. Abuja Lodge"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default HostelMutate;
