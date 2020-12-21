import React, { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { objectCompare, omitNull } from 'utils/common';
import ChangeContext from 'contexts/InputChangeContext';
import { useDataStyles } from 'pages/data/common/data_styles';
import { NotificationMessage } from 'components/common';
import { INotificationMessage } from 'components/component_interfaces';

type IEditModalProps<T> = {
  editing: T;
  newT: T; // empty instance of T
  show: boolean;
  onClose: (v: boolean) => void;
  onSave: (o: T) => void;
  title: string;
  children: React.ReactNode;
  iMsg: INotificationMessage;
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
  const styles = useDataStyles();
  const { children, title, show, onClose, editing, newT, onSave, iMsg } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(newT);

  const handleSave = () => {
    const toSave = { ...omitNull(editing), ...omitNull(newObj) };
    // console.log(JSON.stringify(toSave))
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: object) => {
    setNewObj(old => Object.assign(old, newProp));
    // get the first key
    const key: string = Object.keys(newProp)[0];
    // create matching key/val object from the item being edited
    const og = { [key]: editing[key] ?? '' };
    const isSame = objectCompare(newProp, og);
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
          <Button className={styles.editSaveButton} onClick={handleSave} disabled={!canSave}>save</Button>
        </ChangeContext.Provider>
        <div className={styles.editMsgs}>
          {iMsg ? <NotificationMessage type={iMsg.type} message={iMsg.message} /> : null}
        </div>
      </Modal>
    </>
  );
}
