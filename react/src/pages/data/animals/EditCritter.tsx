import React, { useState } from 'react';
import { IAnimal } from 'types/animal';
import Modal from 'components/Modal';

type ICritterModalProps = {
  show: boolean;
  onClose: (v: boolean) => void;
  isEdit: boolean;
  editing?: IAnimal; 
};

const editableProps = ['nickname', 'animal_id'];

export default function CritterModal({ show, onClose, isEdit, editing }: ICritterModalProps) {
  const t = isEdit ? `Editing animal ${editing?.nickname ?? editing?.animal_id ?? ''}` : `Add a new animal`;
  return (
    <Modal open={show} handleClose={onClose} title={t}>
      <h2>{isEdit ? 'EDIT MODE' : 'ADD MODE'}</h2>
      {editableProps.map((prop: string) => {

      })}
    </Modal>
  );
}
