import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateRoom,
  useHostels,
  useUpdateRoom,
} from '../../../hooks/useHostels';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function HostalRoomsMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);
  const { data: hostelResponse } = useHostels();
  const hostels = hostelResponse?.data || [];
  const [hostelId, setHostelId] = useState(data?.hostel_id || hostels[0]?.id);
  const [floor, setFloor] = useState(data?.floor);
  const [roomNumber, setRoomNumber] = useState(data?.room_number);
  const [availableBeds, setAvailableBeds] = useState(data?.available_beds);
  const [occupiedBeds, setOccupiedBeds] = useState(data?.occupiedbeds || '0');
  const [description, setDescription] = useState(data?.description);

  const { mutate: createRoom, isPending: creating } = useCreateRoom();
  const { mutate: updateRoom, isPending: updating } = useUpdateRoom();

  const isPending = creating || updating;

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      hostel_id: hostelId,
      floor,
      room_number: roomNumber,
      available_beds: availableBeds,
      occupiedbeds: occupiedBeds,
      description,
      id: data?.id,
    };

    if (isEdit) {
      updateRoom(payload, {
        onSuccess: () => {
          toast.success('Hostel room updated successfully.');
          closeModal();
        },
      });
    } else {
      const { id: _id, ...createPayload } = payload;
      createRoom(createPayload, {
        onSuccess: () => {
          toast.success('Hostel room created successfully.');
          closeModal();
        },
      });
    }
  };

  return (
    <CustomModal
      isOpen={true}
      title={isEdit ? 'Update Hostel Room' : 'Add Hostel Room'}
      subtitle="Define a room within a hostel (floor, room number, bed capacity)."
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="room-form"
            className="modal-submit"
            disabled={isPending || !roomNumber.trim()}
          >
            {isPending ? <Spinner /> : isEdit ? 'Update Room' : 'Add Room'}
          </button>
        </>
      }
    >
      <form id="room-form" className="form-grid" onSubmit={onSubmit}>
        {/* Select Hostel */}
        <div className="form-group col-2">
          <label className="modal-label">Select Hostel</label>
          <select
            className="modal-input"
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
            required
          >
            <option value="">-- Select Hostel --</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
        </div>

        {/* Floor */}
        <div className="form-group col-2">
          <label className="modal-label">Floor</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. First Floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            required
          />
        </div>

        {/* Room Number */}
        <div className="form-group col-2">
          <label className="modal-label">Room Number</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. 001"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Available Beds */}
        <div className="form-group col-2">
          <label className="modal-label">Available Beds</label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 4"
            min={1}
            value={availableBeds}
            onChange={(e) => setAvailableBeds(e.target.value)}
            required
          />
        </div>

        {/* Occupied Beds */}
        <div className="form-group col-2">
          <label className="modal-label">Occupied Beds</label>
          <input
            type="number"
            className="modal-input"
            placeholder="e.g. 1"
            min={0}
            value={occupiedBeds}
            onChange={(e) => setOccupiedBeds(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group col-2">
          <label className="modal-label">Description</label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. CHUKD HOSTEL ROOMS"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </CustomModal>
  );
}

export default HostalRoomsMutate;
