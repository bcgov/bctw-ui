import { Animal } from 'types/animal';
import { cloneElement, useState, useEffect } from 'react';
import { eCritterPermission } from 'types/user';
import { IAddEditProps } from 'pages/data/common/AddEditViewer';
import { useQueryClient } from 'react-query';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/common';
import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';

type IModifyWrapperProps = {
  editing: Animal;
  children: JSX.Element;
};

// wraps the AddEditViewer to provide additional critter/user-specific functionality
export default function ModifyCritterWrapper(props: IModifyWrapperProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const { editing, children } = props;
  const [perm, setPerm] = useState<eCritterPermission>(eCritterPermission.none);
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  // must be defined before mutation declarations
  const onSaveSuccess = async (data: Animal[] | Animal): Promise<void> => {
    const critter = Array.isArray(data) ? data[0] : data;
    responseDispatch({ type: 'success', message: `${critter.name} saved!` });
    invalidateCritterQueries();
  };

  const onDeleteSuccess = async (): Promise<void> => {
    responseDispatch({ type: 'success', message: `critter deleted successfully` });
    invalidateCritterQueries();
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  // force refetch on critter queries
  const invalidateCritterQueries = async (): Promise<void> => {
    queryClient.invalidateQueries('critters_assigned');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('getType');
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCritter({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveCritter = async (a: IUpsertPayload<Animal>): Promise<Animal[]> => await saveMutation(a);
  const deleteCritter = async (critterId: string): Promise<void> => {
    const payload: IDeleteType = {
      id: critterId,
      objType: 'animal'
    };
    await deleteMutation(payload);
  };

  useEffect(() => {
    const upd = (): void => {
      setHasCollar(!!editing?.device_id)
      setPerm(editing?.permission_type)
    }
    upd();
  }, [editing]);

  const deleteMessage = ():string => {
    const base = hasCollar ? `CAREFUL! Performing this action will remove the collar ${editing?.device_id} from this animal. ` : '';
    return `${base}This will prevent other users from seeing this critter. Are you sure you want to delete ${editing?.name}?`
  }

  const handleDeleteButtonClicked = (): void => {
    setShow(o=> !o);
  }

  const handleConfirmDelete = (): void => {
    deleteCritter(editing?.critter_id)
    setShow(false);
  }

  const passTheseProps: Pick<IAddEditProps<Animal>, 'cannotEdit' | 'onDelete' | 'onSave'> = {
    cannotEdit: perm !== eCritterPermission.change,
    onDelete: handleDeleteButtonClicked,
    onSave: saveCritter,
  }

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShow(false)}
        open={show}
        message={deleteMessage()}
        title={`Deleting ${editing?.name}`}
      />
      {cloneElement(children, passTheseProps)}
    </>
  )
}
