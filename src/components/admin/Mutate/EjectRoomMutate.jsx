import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import { useEjectStudent } from '../../../hooks/useHostels';
import { useStudents } from '../../../hooks/useStudents';

function EjectRoomMutate({ room, closeModal }) {
  const [studentId, setStudentId] = useState('');

  const { data: studentsResponse, isLoading: loadingStudents } = useStudents();
  const allStudents = useMemo(
    () => studentsResponse?.data ?? [],
    [studentsResponse],
  );

  const { mutate: ejectStudent, isPending } = useEjectStudent();

  const roomStudents = useMemo(() => {
    if (room?.students && room.students.length > 0) return room.students;
    const byRoomId = allStudents.filter(
      (s) =>
        String(s.room_id) === String(room?.id) ||
        String(s.hostel_room_id) === String(room?.id),
    );
    return byRoomId.length > 0 ? byRoomId : allStudents;
  }, [room, allStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!studentId) {
      toast.error('Please select a student to eject.');
      return;
    }

    ejectStudent(
      { student_id: Number(studentId), room_id: room?.id },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Student ejected successfully.');
          closeModal();
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || 'Failed to eject student.',
          );
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={true}
      title="Eject Student from Room"
      subtitle={
        room
          ? `Room ${room.room_number} · ${room.hostel?.name ?? ''} · Floor ${room.floor ?? '—'}`
          : 'Remove a student from their assigned hostel room'
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
            form="eject-room-form"
            className="modal-submit"
            style={{ background: 'var(--danger, #e74c3c)' }}
            disabled={isPending || !studentId}
          >
            {isPending ? <Spinner /> : 'Eject Student'}
          </button>
        </>
      }
    >
      <form id="eject-room-form" className="form-grid" onSubmit={handleSubmit}>
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
              <label className="modal-label">Occupied Beds</label>
              <input
                className="modal-input"
                value={room.occupiedbeds ?? '0'}
                disabled
                readOnly
              />
            </div>
          </>
        )}

        {/* STUDENT SELECTOR */}
        <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
          <label className="modal-label">Select Student to Eject</label>
          <select
            className="modal-input"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={loadingStudents}
            required
          >
            <option value="">-- Select Student --</option>
            {roomStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fname} {s.lname}
                {s.regno ? ` · ${s.regno}` : ''}
                {s.department?.name ? ` · ${s.department.name}` : ''}
              </option>
            ))}
          </select>
          {loadingStudents && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
              Loading students…
            </p>
          )}
        </div>

        {/* WARNING */}
        <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--danger,#e74c3c)',
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: 6,
              padding: '8px 12px',
            }}
          >
            ⚠ This will remove the student from the room and free up a bed. This
            action cannot be undone.
          </p>
        </div>
      </form>
    </CustomModal>
  );
}

export default EjectRoomMutate;
