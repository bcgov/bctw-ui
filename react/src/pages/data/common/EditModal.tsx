import { IUpsertPayload } from 'api/api_interfaces';
import { EditModalBaseProps, ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import React, { useEffect, useState } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { Collar } from 'types/collar';
import { objectCompare, omitNull } from 'utils/common';
import { IHistoryPageProps } from 'pages/data/common/HistoryPage';
import { CollarStrings } from 'constants/strings';

import HistoryPage from './HistoryPage';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import Modal from 'components/modal/Modal';
import useDidMountEffect from 'hooks/useDidMountEffect';

/**
 * todo: fixme: move form error handling to this component
 */

export type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: React.ReactNode;
  isEdit: boolean;
  hideSave?: boolean;
  hideHistory?: boolean;
  newT: T;
  showInFullScreen?: boolean;
  onReset?: () => void;
  onValidate?: (o: T) => boolean;
  hasErrors?: () => boolean;
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
  const bctwApi = useTelemetryApi();
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
    hideHistory = false,
    hideSave = false,
    showInFullScreen = true,
    hasErrors
  } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(Object.assign({}, editing));
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>(null);

  // based on the type of T provided, set the history query status
  useEffect(() => {
    const updateParams = (): void => {
      if (editing instanceof Animal) {
        setHistoryParams({
          query: bctwApi.useCritterHistory,
          param: editing.critter_id,
          propsToDisplay: critterFormFields.historyProps.map((p) => p.prop)
        });
      } else if (editing instanceof Collar) {
        setHistoryParams({
          query: bctwApi.useCollarHistory,
          param: editing.collar_id,
          propsToDisplay: [...CollarStrings.editableProps, ...['valid_from', 'valid_to']]
        });
      }
    };
    updateParams();
  }, [editing]);

  useDidMountEffect(() => {
    if (open) {
      setCanSave(false);
    }
  }, [open]);

  const displayHistory = (): void => {
    setShowHistory((o) => !o);
  };

  const handleSave = (): void => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    if (typeof onValidate === 'function') {
      if (!onValidate(body)) {
        console.log('EditModal: save invalid');
        return;
      }
    }
    console.log(JSON.stringify(body, null, 2));
    const toSave: IUpsertPayload<T> = { isEdit, body };
    onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  // fixme: why does isChange exist
  const handleChange = (newProp: Record<string, unknown>, isChange = true): void => {
    if (newProp.hasError) {
      setCanSave(false);
      return;
    }
    // todo: only when prop has actually changed
    // otherwise enabled at form load
    if (typeof hasErrors === 'function') {
      const hasEm = hasErrors();
      setCanSave(!hasEm);
      return;
    }
    const modified = { ...newObj, ...newProp };
    setNewObj(modified);
    // get the first key
    const key: string = Object.keys(newProp)[0];
    // create matching key/val object from the item being edited
    const og = { [key]: editing[key] ?? '' };
    const isSame = objectCompare(newProp, og);
    setCanSave(isChange && !isSame);
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

  const modalProps: ModalBaseProps = { open, handleClose: onClose, title };
  const childrenComponents = (
    // wrap children in the change context provider so they have 
    // access to this components form handler {handleChange}
    <ChangeContext.Provider value={handleChange}>
      {hideSave ? null : (
        <Button className='editSaveBtn' onClick={handleSave} disabled={!canSave}>
          save
        </Button>
      )}
      {showHistory ? (
        <Modal open={showHistory} handleClose={(): void => setShowHistory(false)}>
          <HistoryPage {...historyParams} />
        </Modal>
      ) : null}
      {isEdit && !hideHistory ? (
        <Button onClick={displayHistory}>{`${showHistory ? 'hide' : 'show'} history`}</Button>
      ) : null}
      {children}
    </ChangeContext.Provider>
  );

  return showInFullScreen ? (
    <FullScreenDialog {...modalProps}>{childrenComponents}</FullScreenDialog>
  ) : (
    <Modal {...modalProps}>{childrenComponents}</Modal>
  );
}
