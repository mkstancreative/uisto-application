import { AlertTriangle, RotateCw } from 'lucide-react';
import './adminCommon.css';

/** Replaces a table when its data failed to load. */
function TableError({ message = 'Could not load this list.', onRetry }) {
  return (
    <div className="table-error" role="alert">
      <AlertTriangle size={26} />
      <p className="table-error-title">Something went wrong</p>
      <p className="table-error-msg">{message}</p>
      {onRetry && (
        <button type="button" className="table-error-retry" onClick={onRetry}>
          <RotateCw size={13} /> Try again
        </button>
      )}
    </div>
  );
}

export default TableError;
