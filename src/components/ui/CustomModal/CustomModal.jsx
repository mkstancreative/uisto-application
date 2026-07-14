import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import "./CustomModal.css";

function CustomModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = "default", // default | wide | full
  placement = "center", // center | top
  children,
  footer,
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className={`modal-overlay placement-${placement}`}>
      <div
        className={`modal-card ${size === "wide" ? "modal-wide" : ""} ${size === "medium" ? "modal-medium" : ""} ${size === "default" ? "modal-default" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
              {title}
            </div>
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">{children}</div>

        {/* FOOTER */}
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );

  // Portal → always renders above every stacking context in the layout
  return ReactDOM.createPortal(content, document.body);
}

export default CustomModal;
