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
  children: React.ReactNode;
  newT: T;
  hideSave?: boolean; 
  onReset?: () => void;
  onValidate?: (o: T) => boolean;
};

/**
 * a component that wraps a form and handles:
 * - opening/closing of the modal.
 * - whether the form can be saved 
 * 
 * - uses the ChangeContext provider to force child form components to pass their changeHandlers to this component so that [canSave] can be determined
 * @param newT an empty instance of T used to reset the form
 * @param hideSave optionally hide save button, default to false
 * @param onValidate called before saving
 * @param onReset a close handler for the editCritter/collar pages - since default handler is overwritten in AddEditViewer
 */
export default function EditModal<T>(props: IEditModalProps<T>): JSX.Element {
  const styles = useDataStyles();
  const { children, title, open, handleClose, editing, newT, onSave, onValidate, onReset, hideSave = false } = props;

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
    // reset the context so the current status messaged is shown again
    responseDispatch(null);
    if (typeof onReset === 'function') {
      onReset();
    }
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
          {hideSave ? null : <Button className={styles.editSaveButton} onClick={handleSave} disabled={!canSave}>save</Button>}
        </ChangeContext.Provider>
        <div className={styles.editMsgs}>
          {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null}
        </div>
      </Modal>
    </>
  )
}
