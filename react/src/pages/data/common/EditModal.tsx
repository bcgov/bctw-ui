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
import { Paper } from '@material-ui/core';

/**
 * todo: fixme: move form error handling to this component
 */

export type IEditModalProps<T> = EditModalBaseProps<T> & {
  children: React.ReactNode;
  // will only be true when 'Add' is selected from data management
  isCreatingNew?: boolean;
  hideSave?: boolean;
  hideHistory?: boolean;
  showInFullScreen?: boolean;
  onReset?: () => void;
  // onValidate?: (o: T) => boolean;
  // hasErrors?: () => boolean;
  headerComponent?: JSX.Element;
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
    onSave,
    // onValidate,
    onReset,
    headerComponent,
    isCreatingNew = false,
    hideHistory = false,
    hideSave = false,
    showInFullScreen = true,
    // hasErrors
  } = props;

  const [canSave, setCanSave] = useState<boolean>(false);
  const [newObj, setNewObj] = useState<T>(Object.assign({}, editing));
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyParams, setHistoryParams] = useState<IHistoryPageProps<T>>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>(Object.assign({}));

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

  // when the edit modal opens, disable save
  useDidMountEffect(() => {
    if (open) {
      setCanSave(false);
    }
  }, [open]);

  // if the error state changes, update the save status
  useDidMountEffect(() => {
    const update = (): void => {
      const cs = Object.values(errors).filter(e => !!e);
      setCanSave(cs.length === 0)
    }
    update();
  }, [errors])

  const displayHistory = (): void => setShowHistory((o) => !o);

  const handleSave = (): void => {
    // use Object.assign to preserve class methods
    const body = omitNull(Object.assign(editing, newObj));
    // if (typeof onValidate === 'function') {
    //   if (!onValidate(body)) {
    //     console.log('EditModal: save invalid');
    //     return;
    //   }
    // }
    console.log(JSON.stringify(body, null, 2));
    const toSave: IUpsertPayload<T> = { body };
    // onSave(toSave);
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    console.log(newProp);
    // update the error state
    const key: string = Object.keys(newProp)[0];
    const newErrors = Object.assign(errors, {[key]: newProp.hasError});
    setErrors({...newErrors});
    // update the editing state
    const modified = { ...newObj, ...newProp };
    setNewObj(modified);
    // todo: determine if object has actually changed from original
    // const og = { [key]: editing[key] ?? '' };
    // const isSame = objectCompare(newProp, og);
    // setCanSave(isChange && !isSame);
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
    /**
     * wrap children in the change context provider so they have
     * access to this components handleChange form handler
     */
    <ChangeContext.Provider value={handleChange}>
      {/* the history modal */}
      {showHistory ? (
        <Modal open={showHistory} handleClose={(): void => setShowHistory(false)}>
          <HistoryPage {...historyParams} />
        </Modal>
      ) : null}
      <form className={'rootEditInput'} autoComplete={'off'}>
        <Paper style={{ padding: '1rem' }} elevation={1}>
          {headerComponent}
          <div style={{ display: 'flex', justifyContent:'flex-end' }}>
            {/* show history button */}
            {isCreatingNew || hideHistory ? null : (
              <Button onClick={displayHistory}>{`${showHistory ? 'hide' : 'show'} history`}</Button>
            )}
            {/* save button */}
            {hideSave ? null : (
              <Button className='editSaveBtn' onClick={handleSave} disabled={!canSave}>
                save
              </Button>
            )}
          </div>
          {children}
        </Paper>
      </form>
    </ChangeContext.Provider>
  );

  return showInFullScreen ? (
    <FullScreenDialog {...modalProps}>{childrenComponents}</FullScreenDialog>
  ) : (
    <Modal {...modalProps}>{childrenComponents}</Modal>
  );
}
