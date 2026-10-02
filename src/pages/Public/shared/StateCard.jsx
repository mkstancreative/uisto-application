import React from 'react';

/**
 * Centered message card for empty / error / closed / thank-you states.
 * tone: info | success | warning | danger
 */
function StateCard({ icon: Icon, tone = 'info', title, children, actions, className = '' }) {
  return (
    <div className={`pub-state pub-state--${tone} ${className}`} role={tone === 'danger' ? 'alert' : undefined}>
      {Icon && (
        <span className="pub-state-icon">
          <Icon size={28} />
        </span>
      )}
      {title && <h2>{title}</h2>}
      {children && <div className="pub-state-body">{children}</div>}
      {actions && <div className="pub-state-actions">{actions}</div>}
    </div>
  );
}

export default StateCard;
