import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAssignFee, useFees } from '../../../hooks/useFees';
import { useSessions } from '../../../hooks/useSessions';
import CustomModal from '../../ui/CustomModal/CustomModal';
import Spinner from '../../ui/Spinner/Spinner';

function AssignFeeMutate({ student, closeModal }) {
  const [feeId, setFeeId] = useState('');
  const [sessionId, setSessionId] = useState('');

  const { data: feesResponse, isLoading: loadingFees } = useFees();
  const { data: sessionsResponse, isLoading: loadingSessions } = useSessions();

  const fees = feesResponse?.data ?? [];
  const sessions = sessionsResponse?.data ?? [];

  const { mutate: assignFee, isPending } = useAssignFee();

  const isReady = Boolean(feeId && sessionId);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isReady) {
      toast.error('Please select both a fee and a session.');
      return;
    }

    assignFee(
      {
        student_id: student?.id,
        fee_id: feeId,
        session_id: sessionId,
      },
      {
        onSuccess: (data) => {
          console.log('onSuccess data:', data);
          toast.success(data?.message ?? 'Fee assigned successfully.');
          closeModal();
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Failed to assign fee.');
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={true}
      title="Assign Fee to Student"
      subtitle={
        student
          ? `Assigning fee for ${student.fname ?? ''} ${student.lname ?? ''}`.trim()
          : 'Select a fee and session to assign.'
      }
      size="default"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="assign-fee-form"
            className="modal-submit"
            disabled={isPending || !isReady}
          >
            {isPending ? <Spinner /> : 'Assign Fee'}
          </button>
        </>
      }
    >
      <form id="assign-fee-form" className="form-grid" onSubmit={onSubmit}>
        {/* Student (read-only) */}
        <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
          <label className="modal-label">Student</label>
          <input
            type="text"
            className="modal-input"
            value={
              student
                ? `${student.fname ?? ''} ${student.lname ?? ''}${student.regno ? ' · ' + student.regno : ''}`
                : '—'
            }
            disabled
            readOnly
          />
        </div>

        {/* Fee selector */}
        <div className="form-group col-2">
          <label className="modal-label">Select Fee</label>
          <select
            className="modal-input"
            value={feeId}
            onChange={(e) => setFeeId(e.target.value)}
            required
            disabled={loadingFees}
          >
            <option hidden>-- Select Fee --</option>
            {fees.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name ?? f.fee_name ?? `Fee #${f.id}`}
                {f.amount ? ` — ₦${Number(f.amount).toLocaleString()}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Session selector */}
        <div className="form-group col-2">
          <label className="modal-label">Select Session</label>
          <select
            className="modal-input"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            required
            disabled={loadingSessions}
          >
            <option hidden>-- Select Session --</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.session ?? `Session #${s.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Confirmation preview */}
        {isReady && (
          <div className="form-group col-2" style={{ gridColumn: '1 / -1' }}>
            <label className="modal-label">Summary</label>
            <input
              type="text"
              className="modal-input"
              value={`Student ID: ${student?.id}  ·  Fee ID: ${feeId}  ·  Session ID: ${sessionId}`}
              disabled
              readOnly
            />
          </div>
        )}
      </form>
    </CustomModal>
  );
}

export default AssignFeeMutate;
