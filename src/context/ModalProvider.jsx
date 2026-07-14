import React, { useState } from 'react';
import { ModalContext } from './ModalContext';

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const openModal = (modalContent) => {
    setModal(modalContent);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modal && (
        <div className="modal-overlay">
          {React.cloneElement(modal, { closeModal })}
        </div>
      )}
    </ModalContext.Provider>
  );
};
