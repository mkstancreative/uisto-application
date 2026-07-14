import React, { useState, useEffect } from 'react';
import CustomModal from '../../ui/CustomModal/CustomModal';
import { AlertCircle } from 'lucide-react';
import Spinner from '../../ui/Spinner/Spinner';

function LoanPenaltyMutate({ target, returning, onConfirm, onCancel }) {
  const [penalty, setPenalty] = useState('');

  useEffect(() => {
    const setPenaltyFn = () => {
      const returnDate = new Date(target.toreturn);
      const today = new Date();

      if (returnDate < today) {
        const overdueDays = Math.ceil(
          (today - returnDate) / (1000 * 60 * 60 * 24),
        );
        setPenalty(String(overdueDays * 500));
      } else {
        setPenalty('');
      }
    };

    if (target?.toreturn) {
      setPenaltyFn();
    }
  }, [target]);

  const handleConfirm = () => {
    if (!penalty || Number(penalty) <= 0) return;

    onConfirm({
      book_id: target.book_id,
      student_id: target.student_id,
      penalty: Number(penalty),
    });
  };

  return (
    <CustomModal
      isOpen={Boolean(target)}
      onClose={onCancel}
      title="Collect Loan Penalty"
      icon={<AlertCircle size={16} color="#ef4444" />}
      size="default"
      footer={
        <>
          <button
            className="modal-cancel"
            onClick={onCancel}
            disabled={returning}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            disabled={returning || !penalty || Number(penalty) <= 0}
            onClick={handleConfirm}
          >
            {returning ? <Spinner /> : 'Collect Penalty'}
          </button>
        </>
      }
    >
      {target && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            {[
              {
                label: 'Student',
                value:
                  target.student?.fname + ' ' + target.student?.lname || '',
              },
              {
                label: 'Book',
                value: target.book?.title || `--`,
              },
              {
                label: 'Loaned On',
                value: target.borroweddate
                  ? new Date(target.borroweddate).toLocaleDateString()
                  : '—',
              },
              {
                label: 'Due Date',
                value: target.toreturn
                  ? new Date(target.toreturn).toLocaleDateString()
                  : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="info-card">
                <p className="info-label">{label}</p>
                <p className="info-value">{value}</p>
              </div>
            ))}
          </div>

          {target.toreturn && new Date(target.toreturn) < new Date() && (
            <div className="overdue-box">
              <AlertCircle size={14} color="#ef4444" />
              <span>
                Overdue by{' '}
                {Math.ceil(
                  (new Date() - new Date(target.toreturn)) /
                    (1000 * 60 * 60 * 24),
                )}{' '}
                day(s)
              </span>
            </div>
          )}

          <div>
            <label className="modal-label">Penalty Amount (₦)</label>
            <input
              type="number"
              value={penalty}
              readOnly
              className="modal-input"
            />
            <p className="modal-hint">₦500 per day overdue (auto-calculated)</p>
          </div>
        </div>
      )}
    </CustomModal>
  );
}

export default LoanPenaltyMutate;
