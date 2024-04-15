import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { cloneElement, useEffect, useState } from 'react';
import { AttachedCritter, Critter } from 'types/animal';
import { editObjectToEvent } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { IAddEditProps } from '../common/AddEditViewer';

type IModifyWrapperProps = {
  editing: Critter | AttachedCritter;
  children: JSX.Element;
  onDelete?: (v: string) => void;
  onUpdate?: (v: string) => void;
  setCritter?: (a: Critter | AttachedCritter) => void;
};

/**
 * wraps child components to provide the GET/POST requests for the animal
 */
export default function ModifyCritterWrapper(props: IModifyWrapperProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  const { children, editing, onDelete, onUpdate } = props;
  // used in child AddEditViewer component to determine the add/edit button state (view/edit)
  const [canEdit, setCanEdit] = useState(false);
  // used to determine the state of the delete modal
  const [hasCollar, setHasCollar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [animal, setAnimal] = useState<typeof editing>(editing);
  // const [refreshPage, setRefreshPage] = useState(false);

  // fetch the critter, assume it's attached for now
  const { data, status } = api.useType<AttachedCritter>('animal', editing.critter_id, {
    enabled: !!editing.critter_id
  });

  /**
   * note: if data has been previously fetched, 'status' will not be updated.
   * in that case, check if @var data exists and call @function setAnimal
   */

  useEffect(() => {
    if (status === 'success') {
      if (data.assignment_id) {
        const a = editObjectToEvent(data, new AttachedCritter(data.critter_id), []);
        setAnimal(a);
      } else {
        setAnimal(editObjectToEvent(data, new Critter(data.critter_id), []));
      }
    } else {
      setAnimal(editObjectToEvent({}, new Critter(), [] as never[]));
    }
    setHasCollar(editing instanceof AttachedCritter);
    setCanEdit(true);
  }, [data, status, editing]);

  // must be defined before mutation declarations
  const handleSaveResult = async (data: IBulkUploadResults<Critter>): Promise<void> => {
    const { errors } = data;
    //The response of this mutation should not be BulkResponse
    if (errors?.length) {
      showNotif({ severity: 'error', message: `${errors.map((e) => e.error)}` });
    } else {
      //const critter = results[0];
      showNotif({ severity: 'success', message: `${editing.critter_id} saved!` });
      //setCritter(results[0]);
      onUpdate?.(editing.critter_id);
    }
  };

  const handleDeleteResult = async (): Promise<void> => {
    showNotif({ severity: 'success', message: `critter deleted successfully` });
    if (typeof onDelete === 'function') {
      onDelete?.(editing.critter_id);
    }
  };

  const onError = (error: AxiosError): void => {
    showNotif({ severity: 'error', message: formatAxiosError(error) });
  };

  // setup the mutations
  const { mutateAsync: saveCritterbase, isLoading } = api.useBulkUpdateCritterbaseCritter({
    onSuccess: handleSaveResult,
    onError
  });

  const { mutateAsync: deleteMutation } = api.useDelete({ onSuccess: handleDeleteResult, onError });

  const saveCritter = async (a: IUpsertPayload<Critter | AttachedCritter>): Promise<void> => {
    await saveCritterbase(a);
  };

  const deleteCritter = async (critterId: string): Promise<void> => {
    const payload: IDeleteType = {
      id: critterId,
      objType: 'animal'
    };
    await deleteMutation(payload);
  };

  const deleteMessage = (): string => {
    const base = hasCollar
      ? `CAREFUL! Performing this action will remove the collar ${
          (editing as AttachedCritter)?.device_id
        } from this animal. `
      : '';
    return `${base}This will prevent other users from seeing this critter. Are you sure you want to delete ${editing?.name}?`;
  };

  const handleConfirmDelete = (): void => {
    deleteCritter(editing?.critter_id);
    setShowConfirmDelete(false);
  };

  // pass the permission_type down so the AddEditViewer can set the edit/view button status
  const passTheseProps: Pick<
    IAddEditProps<Critter>,
    'onDelete' | 'onSave' | 'cannotEdit' | 'editing' | 'queryStatus'
  > & { busySaving: boolean } = {
    cannotEdit: !canEdit,
    onDelete: (): void => setShowConfirmDelete((o) => !o),
    onSave: saveCritter,
    editing: animal,
    queryStatus: status,
    busySaving: isLoading
  };
  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShowConfirmDelete(false)}
        open={showConfirmDelete}
        message={deleteMessage()}
        title={`Deleting ${editing?.name}`}
      />
      {cloneElement(children, passTheseProps)}
    </>
  );
}
