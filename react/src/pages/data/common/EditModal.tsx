import React, { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { objectCompare } from 'utils/component_helpers';
import ChangeContext from 'contexts/InputChangeContext';

type IEditModalProps<T> = {
  editing: T;
  newT: T; // empty instance of T
  show: boolean;
  onClose: (v: boolean) => void;
  onSave: (o: T) => void;
  title: string;
  children: React.ReactNode;
};

/**
 * a component that wraps a form and handles:
 * - opening/closing of the modal.
 * - whether the form can be saved 
 * - uses the ChangeContext provider to force the
 * child input compents pass their changeHandlers to this component,
 * so that [canSave] can be determined
 */
export default function EditModal<T>(props: IEditModalProps<T>) {
  const {children, title, show, onClose, editing, newT, onSave } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(newT);

  const handleSave = () => {
    const toSave = Object.assign(editing, newObj);
    onSave(toSave);
  };

  // fixme: reverting a change is not unflagging canSave
  const handleChange = (newProp) => {
    setNewObj(old => Object.assign(old, newProp));
    const isSame = objectCompare(newObj as any, editing as any);
    setCanSave(!isSame);
  }

  const reset = () => setCanSave(false);

  const handleClose = () => {
    reset();
    onClose(false);
  }

  return (
    <>
      <Modal open={show} handleClose={handleClose} title={title}>
        <ChangeContext.Provider value={handleChange}>
          {children}
          <Button onClick={handleSave} disabled={!canSave}>save animal</Button>
        </ChangeContext.Provider>
      </Modal>
    </>
  );
}
