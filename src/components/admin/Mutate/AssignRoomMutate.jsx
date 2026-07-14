import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAssignRoom } from '../../../hooks/useHostels';
import { useStudents } from '../../../hooks/useStudents';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function AssignRoomMutate({ room, student: preSelectedStudent, closeModal }) {
  const [studentId, setStudentId] = useState(preSelectedStudent?.id ?? '');

  const { data: studentsResponse, isLoading: loadingStudents } = useStudents();
  const students = studentsResponse?.data || [];

  const { mutate: assignRoom, isPending } = useAssignRoom();

  const freeBeds = room
    ? (room.available_beds ?? 0) - (room.occupiedbeds ?? 0)
    : 0;

  /* limit results for performance */
  const studentOptions = students.slice(0, 100);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!studentId) {
      toast.error('Please select a student');
      return;
    }

    if (freeBeds <= 0) {
      toast.error('This room has no available beds');
      return;
    }

    assignRoom(
      { student_id: studentId, room_id: room?.id },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Room assigned successfully');
          closeModal();
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || 'Failed to assign room',
          );
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={true}
      title="Assign Student to Room"
      subtitle={
        room
          ? `Room ${room.room_number} | ${room.hostel?.name} | Floor ${room.floor}`
          : 'Assign a hostel room to a student'
      }
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button className="modal-cancel" type="button" onClick={closeModal}>
            Cancel
          </button>

          <button
            type="submit"
            form="assign-room-form"
            className="modal-submit"
            disabled={isPending || !studentId || freeBeds <= 0}
          >
            {isPending ? <Spinner /> : 'Assign Room'}
          </button>
        </>
      }
    >
      <form id="assign-room-form" className="form-grid" onSubmit={handleSubmit}>
        {/* ROOM INFO */}
        {room && (
          <>
            <div className="form-group col-2">
              <label className="modal-label">Hostel</label>
              <input
                className="modal-input"
                value={room.hostel?.name ?? '—'}
                disabled
                readOnly
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Room / Floor</label>
              <input
                className="modal-input"
                value={`${room.room_number ?? '—'} · ${room.floor ?? '—'}`}
                disabled
                readOnly
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Free Beds</label>
              <input
                className="modal-input"
                value={freeBeds}
                disabled
                readOnly
                style={{
                  color: freeBeds <= 0 ? 'var(--danger,#e74c3c)' : 'inherit',
                }}
              />
            </div>
          </>
        )}

        {/* STUDENT SELECT */}
        <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
          <label className="modal-label">Select Student</label>

          <select
            className="modal-input"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={loadingStudents}
            required
          >
            <option value="">-- Select Student --</option>

            {studentOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fname} {s.lname}
                {s.regno ? ` · ${s.regno}` : ''}
                {s.department?.name ? ` · ${s.department.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* WARNING */}
        {freeBeds <= 0 && (
          <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--danger,#e74c3c)', fontSize: '0.85rem' }}>
              ⚠ This room has no available beds.
            </p>
          </div>
        )}
      </form>
    </CustomModal>
  );
}

export default AssignRoomMutate;
