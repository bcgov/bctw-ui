import React, { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { objectCompare, omitNull } from 'utils/common';
import ChangeContext from 'contexts/InputChangeContext';
import { useDataStyles } from 'pages/data/common/data_styles';
import { NotificationMessage } from 'components/common';
import { EditModalBaseProps } from 'components/component_interfaces';
import { useResponseDispatch, useResponseState } from 'contexts/ApiResponseContext';

type IEditModalProps<T> = EditModalBaseProps<T> & {
  newT: T; // empty instance of T
  onValidate?: (o: T) => boolean;
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
export default function EditModal<T>(props: IEditModalProps<T>): JSX.Element {
  const styles = useDataStyles();
  const { children, title, open, handleClose, editing, newT, onSave, onValidate } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(newT);

  const responseState = useResponseState();
  const responseDispatch = useResponseDispatch();

  const handleSave = (): void => {
    const isValid = onValidate(newObj);
    if (!isValid) {
      return;
    }
    const toSave = { ...omitNull(editing), ...omitNull(newObj) };
    // console.log(JSON.stringify(toSave))
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    setNewObj(old => Object.assign(old, newProp));
    // get the first key
    const key: string = Object.keys(newProp)[0];
    // create matching key/val object from the item being edited
    const og = { [key]: editing[key] ?? '' };
    const isSame = objectCompare(newProp, og);
    setCanSave(!isSame);
  }

  const reset = (): void => {
    setCanSave(false);
    responseDispatch(null); // reset the context so the current status messaged is shown again
  }

  const onClose = (): void => {
    reset();
    handleClose(false);
  }

  return (
    <>
      <Modal open={open} handleClose={onClose} title={title}>
        <ChangeContext.Provider value={handleChange}>
          {children}
          <Button className={styles.editSaveButton} onClick={handleSave} disabled={!canSave}>save</Button>
        </ChangeContext.Provider>
        <div className={styles.editMsgs}>
          {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null}
        </div>
      </Modal>
    </>
  )
}
