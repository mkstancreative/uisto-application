import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./ActionDropdown.css";

function ActionDropdown({ actions = [] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const [dropdownStyles, setDropdownStyles] = useState({});

    /* Compute dropdown position for portal */
    useEffect(() => {
        if (!open) return;
        const updateBounds = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                setDropdownStyles({
                    position: "fixed",
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right,
                    zIndex: 999999,
                });
            }
        };
        updateBounds();

        window.addEventListener("scroll", updateBounds, true);
        window.addEventListener("resize", updateBounds);

        return () => {
            window.removeEventListener("scroll", updateBounds, true);
            window.removeEventListener("resize", updateBounds);
        };
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            const isOutsideTrigger = ref.current && !ref.current.contains(e.target);
            const isOutsideMenuArea = menuRef.current ? !menuRef.current.contains(e.target) : true;

            if (isOutsideTrigger && isOutsideMenuArea) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="action-dropdown" ref={ref}>
            <button
                className="action-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-label="Actions"
            >
                <span className="action-dot" />
                <span className="action-dot" />
                <span className="action-dot" />
            </button>

            {/* Action Menu Portal */}
            {open && createPortal(
                <div className="action-menu" style={dropdownStyles} ref={menuRef}>
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            className={`action-item${action.danger ? " danger" : ""}`}
                            disabled={Boolean(action.disabled)}
                            onClick={() => {
                                setOpen(false);
                                if (action.href) {
                                    navigate(action.href);
                                } else {
                                    action.onClick?.();
                                }
                            }}
                        >
                            {action.icon && <span className="action-item-icon">{action.icon}</span>}
                            {action.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export default ActionDropdown;
