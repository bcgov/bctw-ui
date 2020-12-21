import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IAddEditProps<T> = {
  children: React.CElement<any, any>;
  editing: T;
  empty: () => T;
  onClose?: () => void;
};

/**
 * component that handles the modal show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param children child component that handles the editing, {EditModal} ** must be only one child
 * @param editing object that is passed to editor when Edit is selected
 * @param empty an function that returns a 'naked' instance of T, passed to editor when Add is selected 
**/
export default function AddEditViewer<T>(props: IAddEditProps<T>) {
  const { editing, children: child, empty, onClose } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClickAdd = () => {
    setIsEditMode(false);
    setEditObj(empty());
    setShowModal(o => !o);
  };

  const handleClickEdit = () => {
    setIsEditMode(true);
    setEditObj(editing);
    setShowModal((o) => !o);
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  }

  // additional props to pass to editor component
  const editorProps = {
    editing: editObj,
    show: showModal,
    isEdit: isEditMode,
    onClose: handleClose
  }
  return (
    <>
      {/* clone element to pass additional props to it */}
      {React.cloneElement(child, editorProps)}
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClickAdd}>add</Button>
        <Button disabled={Object.keys(editing ?? {}).length === 0} onClick={handleClickEdit}>edit</Button>
      </ButtonGroup>
    </>
  );
}
