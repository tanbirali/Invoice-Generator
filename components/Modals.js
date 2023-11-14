"use client";
import React from 'react';
import Modal from 'react-modal';

// Modal.setAppElement('#__next');
 // Set the root element for accessibility

const MyModal = ({ isOpen, onRequestClose, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="My Modal"
    >
      <div>
        <button onClick={onRequestClose}>X</button>
        {children}
      </div>
    </Modal>
  );
};

export default MyModal;