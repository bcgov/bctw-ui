import { cloneElement, useEffect, useState } from 'react';
import { IAddEditProps } from 'pages/data/common/AddEditViewer';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { AttachedCollar, Collar } from 'types/collar';
import { permissionCanModify } from 'types/permission';
import { plainToClass } from 'class-transformer';

type IModifyWrapperProps = {
  editing: AttachedCollar | Collar;
  children: JSX.Element;
  onDelete?: (v: string) => void;
  onUpdate?: (v: string) => void;
};

// wraps the AddEditViewer to provide additional critter/user-specific functionality
export default function ModifyCollarWrapper(props: IModifyWrapperProps): JSX.Element {
  const api = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const { children, editing, onDelete, onUpdate } = props;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [device, setDevice] = useState<typeof editing>(editing);

  // fetch the device if the currently selected row has a device id. assume it's an attached collar
  const { data, status } = api.useType<AttachedCollar>('device', editing.collar_id, { enabled: !!editing.collar_id });

  useEffect(() => {
    if (data || status === 'success') {
      // verify the attachment status
      if (data.assignment_id) {
        setDevice(plainToClass(AttachedCollar, data));
      } else {
        setDevice(plainToClass(Collar, data));
      }
    }
    setCanEdit(permissionCanModify(editing?.permission_type));
  }, [editing, status]);

  // handlers for mutation response
  const onSaveSuccess = (data: IBulkUploadResults<Collar>): void => {
    if (data.errors.length) {
      responseDispatch({ severity: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const collar = data.results[0];
    responseDispatch({ severity: 'success', message: `collar ${collar.device_id} saved` });
    onUpdate?.(collar.collar_id);
  };

  const onError = (error: AxiosError): void =>
    responseDispatch({ severity: 'error', message: formatAxiosError(error) });

  const onDeleteSuccess = async (): Promise<void> => {
    responseDispatch({ severity: 'success', message: `collar deleted successfully` });
    if (typeof onDelete === 'function') {
      onDelete?.(editing.collar_id);
    }
  };

  // setup the mutation collar mutations
  const { mutateAsync: saveMutation } = api.useSaveDevice({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = api.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveCollar = async (payload: IUpsertPayload<Collar>): Promise<void> => {
    await saveMutation(payload);
  };

  const deleteCollar = async (): Promise<void> => {
    const payload: IDeleteType = {
      id: editing.collar_id,
      objType: 'collar'
    };
    await deleteMutation(payload);
  };

  const createDeleteMessage = (): string => {
    const base = editing instanceof AttachedCollar ? `CAREFUL! An animal is attached to this collar. ` : '';
    return `${base}Deleting this collar will prevent other users from accessing it. Are you sure you want to delete it?`;
  };

  const handleConfirmDelete = (): void => {
    deleteCollar();
    setShowConfirmDelete(false);
  };

  const passTheseProps: Pick<
    IAddEditProps<Collar>,
    'onDelete' | 'onSave' | 'cannotEdit' | 'editing' | 'queryStatus'
  > = {
    cannotEdit: !canEdit,
    onDelete: (): void => setShowConfirmDelete((o) => !o),
    onSave: saveCollar,
    editing: device,
    queryStatus: status
  };

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShowConfirmDelete(false)}
        open={showConfirmDelete}
        message={createDeleteMessage()}
        title={`Deleting ${editing?.device_id} (${editing.device_make})`}
      />
      {cloneElement(children, passTheseProps)}
    </>
  );
}
