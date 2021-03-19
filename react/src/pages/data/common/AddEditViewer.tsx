import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';
import { BCTW } from 'types/common_types';
import { IUpsertPayload } from 'api/api_interfaces';
import { IEditModalProps } from 'pages/data/common/EditModal';

export type IAddEditProps<T> = {
  cannotEdit?: boolean;
  children: JSX.Element;
  disableAdd?: boolean;
  disableEdit?: boolean;
  editBtn?: JSX.Element;
  editing: T;
  empty: T;
  onDelete?: (id: string) => void;
  onSave?: (a: IUpsertPayload<T>) => void;
};

/**
 * component that handles the modal show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param cannotEdit permission to edit?
 * @param children child component that handles the editing, {EditModal} ** must be only one child
 * @param disableAdd optional - hide add button
 * @param disableEdit defaults to false
 * @param editing isntance of T passed to editor when edit button is clicked
 * @param empty 'new' instance of T passed to editor when add button is clicked
 * @param onDelete
 * @param editButton optional - used in map overview screens
 **/
export default function AddEditViewer<T extends BCTW>(props: IAddEditProps<T>): JSX.Element {
  const { cannotEdit, children, disableAdd, disableEdit, editBtn, editing, empty, onDelete, onSave } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClickAdd = (): void => {
    setIsEditMode(false);
    setEditObj(empty);
    setShowModal((o) => !o);
  };

  const handleClickEdit = (): void => {
    setIsEditMode(true);
    setEditObj(editing);
    setShowModal((o) => !o);
  };

  const enableDelete = (): boolean => {
    const isFn = typeof onDelete === 'function';
    return !!isFn;
  };

  const handleClickDelete = (): void => {
    if (enableDelete()) {
      onDelete(editing[editing.identifier ?? 'id']);
    }
  };

  const handleClickSave = (p): void => {
    if (typeof onSave === 'function') {
      onSave(p)
    }
  }
  
  const handleClose = (): void => {
    setShowModal(false);
  };

  // override the open/close handlers and props
  // of the child EditModal component
  const editorProps: Pick<IEditModalProps<T>, 'editing' |'open' | 'isEdit' | 'onSave' | 'handleClose'> = {
    editing: editObj,
    open: showModal,
    isEdit: isEditMode,
    handleClose,
    onSave: handleClickSave
  };

  // do the same for the edit btn props
  const editBtnProps = {
    disabled: disableEdit ? true : Object.keys(editing).length === 0,
    onClick: handleClickEdit
  };

  // override for Critter/Collar map overview pages
  if (editBtn) {
    return (
      <>
        {React.cloneElement(children, editorProps)}
        {React.cloneElement(editBtn, editBtnProps)}
      </>
    );
  }

  return (
    <>
      {/* clone element to pass additional props to it */}
      {React.cloneElement(children, editorProps)}
      <ButtonGroup size='small' variant='contained' color='primary'>
        {enableDelete() ? (
          <Button color='secondary' disabled={cannotEdit || !editing[editing.identifier]} onClick={handleClickDelete}>
            delete
          </Button>
        ) : null}
        {disableAdd ? null : <Button onClick={handleClickAdd}>add</Button>}
        <Button {...editBtnProps}>{cannotEdit ? 'view' : 'edit'}</Button>
      </ButtonGroup>
    </>
  );
}
