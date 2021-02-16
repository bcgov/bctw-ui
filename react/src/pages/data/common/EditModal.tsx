import 'styles/Data.scss';

import { IUpsertPayload } from 'api/api_interfaces';
import { NotificationMessage } from 'components/common';
import { EditModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { useResponseState } from 'contexts/ApiResponseContext';
import ChangeContext from 'contexts/InputChangeContext';
import React, { useState } from 'react';
import { critterHistoryProps, isAnimal } from 'types/animal';
import { isCollar } from 'types/collar';
import { collarHistoryProps } from 'types/collar_history';
import { objectCompare, omitNull } from 'utils/common';

import HistoryPage from './HistoryPage';

type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: React.ReactNode;
  newT: T;
  hideSave?: boolean;
  onReset?: () => void;
  onValidate?: (o: T) => boolean;
  isEdit: boolean;
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
  const {
    children,
    title,
    open,
    handleClose,
    editing,
    newT,
    onSave,
    onValidate,
    onReset,
    isEdit,
    hideSave = false
  } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(newT);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const editType = isAnimal(editing) ? 'critter' : isCollar(editing) ? 'collar' : '';
  // fixme: document
  const historyQuery = editType === 'critter' ? 'useCritterHistory' : editType === 'collar' ? 'useCollarHistory' : '';
  const getHistoryId = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = editing as any;
    return editType === 'collar' ? u.collar_id : u.id;
  };
  const getHistoryProps = (): string[] =>
    editType === 'collar' ? collarHistoryProps : editType === 'critter' ? critterHistoryProps : [];

  const responseState = useResponseState();

  const displayHistory = (): void => {
    setShowHistory((o) => !o);
  };

  const handleSave = (): void => {
    const isValid = onValidate(newObj);
    if (!isValid) {
      return;
    }
    const toSave: IUpsertPayload<T> = {
      isEdit,
      body: { ...omitNull(editing), ...omitNull(newObj) }
    };
    // console.log(JSON.stringify(toSave))
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    setNewObj((old) => Object.assign(old, newProp));
    // get the first key
    const key: string = Object.keys(newProp)[0];
    // create matching key/val object from the item being edited
    const og = { [key]: editing[key] ?? '' };
    const isSame = objectCompare(newProp, og);
    setCanSave(!isSame);
  };

  const reset = (): void => {
    setShowHistory(false);
    setCanSave(false);
    if (typeof onReset === 'function') {
      onReset();
    }
  };

  const onClose = (): void => {
    reset();
    handleClose(false);
  };

  return (
    <Modal open={open} handleClose={onClose} title={title}>
      {showHistory ? (
        <HistoryPage historyQuery={historyQuery} itemId={getHistoryId()} propsToDisplay={getHistoryProps()} />
      ) : (
        <ChangeContext.Provider value={handleChange}>
          {children}
          {hideSave ? null : (
            <Button className='editSaveBtn' onClick={handleSave} disabled={!canSave}>
              save
            </Button>
          )}
        </ChangeContext.Provider>
      )}
      <div className='editMsgs'>
        {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null}
      </div>
      {isEdit ? <Button onClick={displayHistory}>{`${showHistory ? 'hide' : 'show'} history`}</Button> : null}
    </Modal>
  );
}
