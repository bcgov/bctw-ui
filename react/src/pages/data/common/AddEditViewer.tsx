import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';
import { BCTW } from 'types/common_types';

export type IAddEditProps<T> = {
  cannotEdit?: boolean;
  children: JSX.Element;
  disableEdit?: boolean;
  editing: T;
  empty: T; onDelete?: (id: string) => void;
};

/**
 * component that handles the modal show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param cannotEdit permission to edit?
 * @param children child component that handles the editing, {EditModal} ** must be only one child
 * @param disableEdit defaults to false
 * @param editing isntance of T passed to editor when edit button is clicked
 * @param empty 'new' instance of T passed to editor when add button is clicked
 **/
export default function AddEditViewer<T extends BCTW>(props: IAddEditProps<T>): JSX.Element {
  const { cannotEdit, editing, children, empty, onDelete } = props;

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

  const handleClickDelete = (): void => {
    if (typeof onDelete === 'function') {
      onDelete(editing[editing.identifier ?? 'id']);
    }
  };

  const handleClose = (): void => {
    setShowModal(false);
  };

  // override the open/close handlers and props
  // of the child EditModal component
  const editorProps = {
    editing: editObj,
    open: showModal,
    isEdit: isEditMode,
    handleClose
  };

  // dont enable the edit button if its a "new" instance of T
  const disableEdit = props.disableEdit ? true : Object.keys(editing).length === 0;
  return (
    <>
      {/* clone element to pass additional props to it */}
      {React.cloneElement(children, editorProps)}
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button color='secondary' disabled={cannotEdit} onClick={handleClickDelete}>
          delete
        </Button>
        <Button onClick={handleClickAdd}>add</Button>
        <Button disabled={disableEdit} onClick={handleClickEdit}>
          {cannotEdit ? 'view' : 'edit'}
        </Button>
      </ButtonGroup>
    </>
  );
}
