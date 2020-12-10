import React, { useState } from 'react';
import { IAnimal } from 'types/animal';
import Modal from 'components/Modal';

type ICritterModalProps = {
  show: boolean;
  onClose: (v: boolean) => void;
  isEdit: boolean;
}

export default function CritterModal({show, onClose, isEdit}: ICritterModalProps) {
  return (
    <Modal open={show} handleClose={onClose} >
      <h2>{isEdit ? 'EDIT MODE' : 'ADD MODE'}</h2>
    </Modal>
  )
}