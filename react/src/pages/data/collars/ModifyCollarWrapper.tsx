import { cloneElement, useState, useEffect } from 'react';
import { eCritterPermission } from 'types/user';
import { IAddEditProps } from 'pages/data/common/AddEditViewer';
import { useQueryClient } from 'react-query';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/common';
import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { Collar } from 'types/collar';

type IModifyWrapperProps = {
  editing: Collar;
  children: JSX.Element;
};

// wraps the AddEditViewer to provide additional critter/user-specific functionality
export default function ModifyCollarWrapper(props: IModifyWrapperProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const { editing, children } = props;
  const [show, setShow] = useState<boolean>(false);

  // handlers for mutation response
  const onSaveSuccess = (data: IBulkUploadResults<Collar>): void => {
    if (data.errors.length) {
      responseDispatch({ type: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const collar = data.results[0];
    responseDispatch({ type: 'success', message: `collar ${collar.device_id} saved` });
    queryClient.invalidateQueries('collartype');
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  const onDeleteSuccess = async (): Promise<void> => {
    responseDispatch({ type: 'success', message: `collar deleted successfully` });
    queryClient.invalidateQueries('collartype');
  };

  // setup the mutation collar mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCollar({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveCollar = async (c: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => await saveMutation(c);
  const deleteCollar = async (): Promise<void> => {
    const payload: IDeleteType = {
      id: editing.collar_id,
      objType: 'collar'
    };
    await deleteMutation(payload);
  };

  const createDeleteMessage = (): string => {
    const base = editing.animal_id
      ? `CAREFUL! An animal with ID ${editing.animal_id} is attached to this collar. `
      : '';
    return `${base}Deleting this collar will prevent other users from accessing it. Are you sure you want to delete it?`;
  };

  const handleDeleteButtonClicked = (): void => {
    setShow(o=> !o);
  }

  const handleConfirmDelete = (): void => {
    deleteCollar()
    setShow(false);
  }

  const passTheseProps: Pick<IAddEditProps<Collar>, 'onDelete' | 'onSave'> = {
    onDelete: handleDeleteButtonClicked,
    onSave: saveCollar,
  }

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShow(false)}
        open={show}
        message={createDeleteMessage()}
        title={`Deleting ${editing?.device_id} (${editing.device_make})`}
      />
      {cloneElement(children, passTheseProps)}
    </>
  )
}
