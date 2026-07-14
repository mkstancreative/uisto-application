import React, { useMemo } from 'react';
import { toast } from 'react-toastify';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';
import {
  useEjectStudent,
  useEjectAllStudents,
} from '../../../hooks/useHostels';
import {
  Building2,
  MapPin,
  BedDouble,
  UsersRound,
  Phone,
  GraduationCap,
  UserRound,
  UserMinus2,
  UserMinus,
} from 'lucide-react';

function ViewRoomStudentsMutate({ room, closeModal }) {
  const { mutate: ejectStudent, isPending: isEjecting } = useEjectStudent();
  const { mutate: ejectAllStudents, isPending: isEjectingAll } =
    useEjectAllStudents();

  const roomStudents = useMemo(() => {
    return room?.students || [];
  }, [room]);

  const handleEjectStudent = (studentId) => {
    ejectStudent(
      { student_id: studentId, room_id: room?.id },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Student ejected successfully.');
          closeModal();
        },
        onError: (error) => {
          toast.error(error?.message || 'Failed to eject student.');
        },
      },
    );
  };
  const handleEjectAll = () => {
    if (
      !window.confirm(
        'Are you sure you want to eject all students from this room?',
      )
    ) {
      return;
    }

    ejectAllStudents(undefined, {
      onSuccess: (data) => {
        toast.success(data?.message || 'All students ejected successfully.');
        closeModal();
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to eject all students.');
        closeModal();
      },
    });
  };
  return (
    <CustomModal
      isOpen={true}
      title="Room Allocation Details"
      subtitle={
        room
          ? `Managing occupancy for Room ${room.room_number}`
          : 'Students assigned to this room'
      }
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button className="modal-cancel" type="button" onClick={closeModal}>
            Close
          </button>
          {roomStudents.length > 0 && (
            <button
              type="button"
              className="modal-submit"
              style={{
                background: 'var(--danger, #e74c3c)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={handleEjectAll}
              disabled={isEjectingAll || isEjecting}
            >
              {isEjectingAll ? <Spinner size={16} /> : <UserMinus size={16} />}
              {isEjectingAll ? 'Processing...' : 'Eject All'}
            </button>
          )}
        </>
      }
    >
      <div
        className="view-students-container"
        style={{ minHeight: '200px', overflowY: 'auto' }}
      >
        {/* ROOM DETAILS CARDS */}
        {room && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                background: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  color: '#818cf8',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: '0.85rem',
                    color: 'var(--accent-grey, #a0aec0)',
                    fontWeight: '600',
                  }}
                >
                  Hostel
                </p>
                <h6 style={{ margin: 0, fontSize: '1rem', color: '#e4e7f0' }}>
                  {room.hostel?.name ?? '—'}
                </h6>
              </div>
            </div>

            <div
              style={{
                background: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'rgba(5, 150, 105, 0.15)',
                  color: '#34d399',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                <MapPin size={24} />
              </div>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: '0.85rem',
                    color: 'var(--accent-grey, #a0aec0)',
                    fontWeight: '600',
                  }}
                >
                  Floor / Room
                </p>
                <h6 style={{ margin: 0, fontSize: '1rem', color: '#e4e7f0' }}>
                  {room.floor ?? '—'} / {room.room_number ?? '—'}
                </h6>
              </div>
            </div>

            <div
              style={{
                background: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'rgba(234, 88, 12, 0.15)',
                  color: '#fb923c',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                <BedDouble size={24} />
              </div>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: '0.85rem',
                    color: 'var(--accent-grey, #a0aec0)',
                    fontWeight: '600',
                  }}
                >
                  Occupancy
                </p>
                <h6 style={{ margin: 0, fontSize: '1rem', color: '#e4e7f0' }}>
                  {room.occupiedbeds ?? '0'}{' '}
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '0.85rem',
                      fontWeight: 'normal',
                    }}
                  >
                    occupied
                  </span>{' '}
                  • {room.available_beds ?? '0'}{' '}
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '0.85rem',
                      fontWeight: 'normal',
                    }}
                  >
                    free
                  </span>
                </h6>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginBottom: '15px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '10px',
          }}
        >
          <h4
            style={{
              margin: 0,
              color: '#e4e7f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <UsersRound size={20} color="var(--accent-grey, #a0aec0)" />
            Allocated Students{' '}
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e4e7f0',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              {roomStudents.length}
            </span>
          </h4>
        </div>

        {roomStudents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <BedDouble
              size={48}
              color="rgba(255, 255, 255, 0.2)"
              style={{ marginBottom: '16px' }}
            />
            <h5 style={{ margin: '0 0 8px 0', color: '#e4e7f0' }}>
              No Occupants Found
            </h5>
            <p
              style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.9rem',
              }}
            >
              This room is currently empty and available for allocation.
            </p>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {roomStudents.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.06)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.03)')
                }
              >
                <div
                  style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#e4e7f0',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                    }}
                  >
                    {student.fname?.charAt(0) || <UserRound size={20} />}
                  </div>
                  <div>
                    <h5
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '1rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {student.fname}{' '}
                      {student.mname && `${student.mname.charAt(0)}.`}{' '}
                      {student.lname}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 'normal',
                        }}
                      >
                        {student.regno || 'N/A'}
                      </span>
                    </h5>
                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '0.85rem',
                        color: 'var(--accent-grey, #a0aec0)',
                      }}
                    >
                      {student.department?.name && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <GraduationCap size={14} /> {student.department.name}
                        </span>
                      )}
                      {student.phone && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Phone size={14} /> {student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#f87171',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                    e.currentTarget.style.color = '#f87171';
                    e.currentTarget.style.borderColor =
                      'rgba(220, 38, 38, 0.2)';
                  }}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to eject ${student.fname} from this room?`,
                      )
                    ) {
                      handleEjectStudent(student.id);
                    }
                  }}
                  disabled={isEjecting || isEjectingAll}
                  title={`Eject ${student.fname}`}
                >
                  <UserMinus2 size={16} />
                  <span>Eject</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomModal>
  );
}

export default ViewRoomStudentsMutate;
