import { Lock } from 'lucide-react';
import './adminCommon.css';

/** Shown in a page header when the signed-in role cannot make changes. */
function ReadOnlyChip() {
  return (
    <span className="ro-chip" title="Your role can view this page but not change it">
      <Lock size={12} />
      Read-only access
    </span>
  );
}

export default ReadOnlyChip;
