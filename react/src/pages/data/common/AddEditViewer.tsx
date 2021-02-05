import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IAddEditProps<T> = {
  children: JSX.Element;
  editing: T;
  empty: () => T;
  disableEdit?: boolean;
};

/**
 * component that handles the modal show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param children child component that handles the editing, {EditModal} ** must be only one child
 * @param editing object that is passed to editor when Edit is selected
 * @param empty an function that returns a 'naked' instance of T, passed to editor when Add is selected 
 * @param disableEdit defaults to false
**/
export default function AddEditViewer<T>(props: IAddEditProps<T>): JSX.Element {
  const { editing, children: child, empty } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClickAdd = (): void => {
    setIsEditMode(false);
    setEditObj(empty());
    setShowModal(o => !o);
  }

  const handleClickEdit = (): void => {
    setIsEditMode(true);
    setEditObj(editing);
    setShowModal((o) => !o);
  }

  const onClose = (): void => {
    setShowModal(false);
  }

  // pass these props to child editer component
  // to allow this component (AddEditViewer) to deal
  // wth the properties/handlers
  const editorProps = {
    editing: editObj,
    open: showModal,
    isEdit: isEditMode,
    handleClose: onClose
  }

  const disableEdit = props.disableEdit ? true : Object.keys(editing ?? {}).length === 0;
  return (
    <>
      {/* clone element to pass additional props to it */}
      {React.cloneElement(child, editorProps)}
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClickAdd}>add</Button>
        <Button disabled={disableEdit} onClick={handleClickEdit}>edit</Button>
      </ButtonGroup>
    </>
  );
}
