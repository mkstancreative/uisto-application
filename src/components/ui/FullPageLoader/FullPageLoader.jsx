import { Loader2 } from 'lucide-react';
import './FullPageLoader.css';

function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="fpl-root" role="status" aria-live="polite">
      <img src="/logo.png" alt="" className="fpl-logo" />
      <Loader2 size={22} className="fpl-spin" />
      <span>{label}</span>
    </div>
  );
}

export default FullPageLoader;
