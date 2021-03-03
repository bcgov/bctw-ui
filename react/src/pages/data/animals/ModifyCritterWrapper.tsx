import { Animal } from 'types/animal';
import { cloneElement, useState, useEffect } from 'react';
import { eCritterPermission } from 'types/user';
import { IAddEditProps } from 'pages/data/common/AddEditViewer';
import ConfirmModal from 'components/modal/ConfirmModal';

type IModifyWrapperProps = {
  editing: Animal;
  children: JSX.Element;
  onDelete: (id: string) => void;
};

// wraps the AddEditViewer to provide additional critter/user-specific functionality
export default function ModifyCritterWrapper(props: IModifyWrapperProps): JSX.Element {
  const { editing, children, onDelete } = props;
  const [perm, setPerm] = useState<eCritterPermission>(eCritterPermission.none);
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const upd = (): void => {
      setHasCollar(!!editing.device_id)
      setPerm(editing.permission_type)
    }
    upd();
  }, [editing]);

  const deleteMessage = ():string => {
    const base = hasCollar ? `CAREFUL! Performing this action will remove the collar ${editing.device_id} from this animal. ` : '';
    return `${base}This will prevent other users from seeing this critter. Are you sure you want to delete ${editing.name}?`
  }

  const handleDeleteButtonClicked = (): void => {
    setShow(o=> !o);
  }

  const handleConfirmDelete = (): void => {
    onDelete(editing.critter_id);
    setShow(false);
  }

  const passTheseProps: Pick<IAddEditProps<Animal>, 'cannotEdit' | 'onDelete'> = {
    cannotEdit: perm !== eCritterPermission.change,
    onDelete: handleDeleteButtonClicked
  }

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShow(false)}
        open={show}
        message={deleteMessage()}
        title={`Deleting ${editing.name}`}
      />
      {cloneElement(children, passTheseProps)}
    </>
  )
}
