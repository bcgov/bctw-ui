import React, { useState } from 'react';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IAddEditProps<T> = {
  children: JSX.Element;
  editing: T;
  empty: () => T;
  customAdd?: JSX.Element;
  propsToPreserve?: string[],
};

/**
 * component that handles the modal show/hide functionality of the childEditComponent
 * used on main data pages (critter/collar)
 * @param children child component that handles the editing, {EditModal} ** must be only one child
 * @param editing object that is passed to editor when Edit is selected
 * @param empty an function that returns a 'naked' instance of T, passed to editor when Add is selected 
**/
export default function AddEditViewer<T>(props: IAddEditProps<T>): JSX.Element {
  const { editing, children: child, empty, customAdd, propsToPreserve } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCustomAdd, setShowCustomAdd] = useState<boolean>(false);

  const handleClickCustomAdd = (): void => setShowCustomAdd(true);

  const handleClickAdd = (): void => {
    setShowCustomAdd(false);
    setIsEditMode(false);
    const o = empty();
    for (const [key, value] of Object.entries(editing)) {
      if (propsToPreserve.includes(key)) {
        o[key] = value;
      }
    }
    // console.log(`add view obj ${JSON.stringify(o)}`);
    setEditObj(o);
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

  const onYes = (): void => {
    customAdd.props.handleClickYes().then(d =>{
      handleClickAdd();
    })
  }
  const onNo = (): void => {
    customAdd.props.handleClose().then(d => {
      handleClickAdd();
    })
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

  const showCustomAddProps = {
    open: showCustomAdd,
    handleClickYes: onYes,
    handleClose: onNo,
  }
  return (
    <>
      {/* clone element to pass additional props to it */}
      {React.cloneElement(child, editorProps)}
      {customAdd ? React.cloneElement(customAdd, showCustomAddProps) : null}
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={customAdd ? handleClickCustomAdd : handleClickAdd}>add</Button>
        <Button disabled={Object.keys(editing ?? {}).length === 0} onClick={handleClickEdit}>edit</Button>
      </ButtonGroup>
    </>
  );
}
