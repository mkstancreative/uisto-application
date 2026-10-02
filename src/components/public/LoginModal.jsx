import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

const COPY = {
  login: { title: "Welcome back", sub: (brand) => `Sign in to ${brand} to continue.` },
  forgot: {
    title: "Reset your password",
    sub: () => "We'll email you a link to choose a new password.",
  },
};

function LoginModal({ open, onClose, brandName }) {
  const [view, setView] = useState("login");

  /* Close on Escape and lock page scroll while open */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const handleClose = () => {
    onClose();
    setView("login");
  };

  const copy = COPY[view];

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="lp-modal-overlay"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="lp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lp-modal-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <button className="lp-modal-close" onClick={handleClose} aria-label="Close">
              <X size={18} />
            </button>

            <div className="lp-modal-head">
              <img src="/logo.png" alt="" className="lp-modal-logo" />
              <h2 id="lp-modal-title">{copy.title}</h2>
              <p>{copy.sub(brandName)}</p>
            </div>

            {view === "login" ? (
              <LoginForm onForgotPassword={() => setView("forgot")} />
            ) : (
              <ForgotPasswordForm onBack={() => setView("login")} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default LoginModal;
