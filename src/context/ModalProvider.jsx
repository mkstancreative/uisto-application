import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ModalContext } from './ModalContext';

/* Modal components render their own overlay (CustomModal portals one), so
   the provider only mounts the current modal and hands it closeModal.
   A modal belongs to the page that opened it: navigating away (including
   signing out) leaves it behind. */
export const ModalProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [modal, setModal] = useState(null);

  const openModal = (modalContent) => {
    setModal({ content: modalContent, pathname });
  };

  const closeModal = () => {
    setModal(null);
  };

  const active = modal && modal.pathname === pathname ? modal.content : null;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {active && React.cloneElement(active, { closeModal })}
    </ModalContext.Provider>
  );
};
