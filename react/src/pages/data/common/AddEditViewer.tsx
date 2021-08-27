import Box from '@material-ui/core/Box';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { IUpsertPayload } from 'api/api_interfaces';
import { EditorProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { IEditModalProps } from 'pages/data/common/EditModal';
import React, { useState } from 'react';
import { BCTWBase } from 'types/common_types';

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
  editText?: string;
  addText?: string
  deleteText?: string;
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
export default function AddEditViewer<T extends BCTWBase>(props: IAddEditProps<T>): JSX.Element {
  const { cannotEdit, children, disableAdd, disableEdit, editBtn, editing, empty, onDelete, onSave, addText, editText, deleteText } = props;

  const [editObj, setEditObj] = useState<T>(editing);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClickAdd = (): void => {
    setIsCreatingNew(true);
    setEditObj(empty);
    setShowModal((o) => !o);
  };

  const handleClickEdit = (): void => {
    setIsCreatingNew(false);
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

  // override the open/close handlers and props of the child EditModal component
  const editorProps: Pick<IEditModalProps<T>, 'editing' |'open' | 'onSave' | 'handleClose' | 'disableHistory'>
  & Pick<EditorProps<T>, 'isCreatingNew'> = {
    // if this is a new instance - pass an empty object
    editing: isCreatingNew ? empty : editObj,
    // required in EditX components (ex. EditCritter)
    isCreatingNew,
    open: showModal,
    disableHistory: isCreatingNew,
    handleClose,
    onSave: handleClickSave,
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
      {/* clone child EditModal component to pass additional props */}
      {React.cloneElement(children, editorProps)}
      <Box className="button-bar">

        {/* render add button */}
        {disableAdd ? null : <Button size="large" variant="contained" color="primary" startIcon={<AddOutlinedIcon />} onClick={handleClickAdd}>{`Add ${addText ?? ''}`}</Button>}

        {/* render edit button */}
        <Button size="large" variant="outlined" color="primary" {...editBtnProps}>{` ${cannotEdit ? 'View' : 'Edit'} ${editText ?? ''}`}</Button>

        {/* render delete button */}
        {enableDelete() ? (
          <Button size="large" variant="outlined" color="primary" startIcon={<DeleteOutlineOutlinedIcon />} disabled={cannotEdit || !editing[editing.identifier]} onClick={handleClickDelete}>
            {`Delete ${deleteText ?? ''}`}
          </Button>
        ) : null}
      </Box>
    </>
  );
}
