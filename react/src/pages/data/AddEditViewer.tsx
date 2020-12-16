import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IAddEditProps<T> = {
  childEditComponent: React.CElement<any, any>; // component that handles the editing
  editing: T; // object that is passed to editor when Edit is selected
  empty: T; // a 'naked' instance of T, passed to editor when Add is selected 
};

/**
 * component that handles the modal show/hide functionality
 *  of theedit component passed in
 * @param props see {IAddEditProps}
 */
export default function AddEditViewer<T>(props: IAddEditProps<T>) {
  const { editing, childEditComponent, empty } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClickAdd = () => {
    setIsEditMode(false);
    setEditObj(empty);
    setShowModal(o => !o);
  };

  const handleClickEdit = () => {
    setIsEditMode(true);
    setEditObj(editing);
    setShowModal((o) => !o);
  };

  const handleClose = () => setShowModal(false);

  // pass on these additional props to the editor
  const editorProps = {
    editing: editObj,
    show: showModal,
    isEdit: isEditMode,
    onClose: handleClose
  }
  return (
    <>
      {/* todo: is cloneElement the best way to do this? */}
      {React.cloneElement(childEditComponent, editorProps)}
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClickAdd}>add</Button>
        <Button disabled={Object.keys(editing ?? {}).length === 0} onClick={handleClickEdit}>edit</Button>
      </ButtonGroup>
    </>
  );
}
