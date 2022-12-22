import { Animal, AttachedAnimal } from 'types/animal';
import { cloneElement, useState, useEffect } from 'react';
import { permissionCanModify  } from 'types/permission';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { IAddEditProps } from '../common/AddEditViewer';
import { plainToClass } from 'class-transformer';

type IModifyWrapperProps = {
  editing: Animal | AttachedAnimal;
  children: JSX.Element;
  onDelete?: (v: string) => void;
  onUpdate?: (v: string) => void;
  setCritter?:(a: Animal | AttachedAnimal) => void
};

/**
 * wraps child components to provide the GET/POST requests for the animal 
 */
export default function ModifyCritterWrapper(props: IModifyWrapperProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  const { children, editing, onDelete, setCritter, onUpdate} = props;
  // used in child AddEditViewer component to determine the add/edit button state (view/edit)
  const [canEdit, setCanEdit] = useState(false);
  // used to determine the state of the delete modal
  const [hasCollar, setHasCollar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [animal, setAnimal] = useState<typeof editing>(editing);
  // const [refreshPage, setRefreshPage] = useState(false);

  // fetch the critter, assume it's attached for now
  const { data, status } = api.useType<AttachedAnimal>('animal', editing.critter_id, {enabled: !!(editing.critter_id)});

  /**
   * note: if data has been previously fetched, 'status' will not be updated.
   * in that case, check if @var data exists and call @function setAnimal
   */
  useEffect(() => {
    if (data || status === 'success') {
      if (data.assignment_id) {
        setAnimal(plainToClass(AttachedAnimal, data));
      } else {
        setAnimal(plainToClass(Animal, data));
      }
    }
    setHasCollar(editing instanceof AttachedAnimal)
    setCanEdit(permissionCanModify(editing.permission_type));

  }, [editing, status]);

  // must be defined before mutation declarations
  const handleSaveResult = async (data: IBulkUploadResults<Animal>): Promise<void> => {
    const { errors, results } = data;
    if (errors.length) {
      showNotif({ severity: 'error', message: `${errors.map(e => e.error)}` });
    } else {
      const critter = results[0];
      showNotif({ severity: 'success', message: `${critter.animal_id} saved!` });
      setCritter(results[0]);
      onUpdate?.(results[0].critter_id)
    }
  };

  const handleDeleteResult = async (): Promise<void> => {
    showNotif({ severity: 'success', message: `critter deleted successfully` });
    if (typeof onDelete === 'function') {
      onDelete?.(editing.critter_id);
    }
  };

  const onError = (error: AxiosError): void => showNotif({ severity: 'error', message: formatAxiosError(error) });

  // setup the mutations
  const { mutateAsync: saveMutation } = api.useSaveAnimal({ onSuccess: handleSaveResult, onError });
  const { mutateAsync: deleteMutation } = api.useDelete({ onSuccess: handleDeleteResult, onError });

  const saveCritter = async (a: IUpsertPayload<Animal | AttachedAnimal>): Promise<void> => {
    const { body } = a;
    const formatted = body.toJSON();
    // console.log('ModifyCritterWrapper: saving animal ', JSON.stringify(formatted, null, 2));
    await saveMutation({ body: formatted})
  } 

  const deleteCritter = async (critterId: string): Promise<void> => {
    const payload: IDeleteType = {
      id: critterId,
      objType: 'animal'
    };
    await deleteMutation(payload);
  };

  const deleteMessage = ():string => {
    const base = hasCollar ? `CAREFUL! Performing this action will remove the collar ${(editing as AttachedAnimal)?.device_id} from this animal. ` : '';
    return `${base}This will prevent other users from seeing this critter. Are you sure you want to delete ${editing?.name}?`
  }

  const handleConfirmDelete = (): void => {
    deleteCritter(editing?.critter_id)
    setShowConfirmDelete(false);
  }
  
  // pass the permission_type down so the AddEditViewer can set the edit/view button status
  const passTheseProps: Pick<IAddEditProps<Animal>, 'onDelete' | 'onSave' | 'cannotEdit' | 'editing' | 'queryStatus'> = {
    cannotEdit: !canEdit,
    onDelete: (): void => setShowConfirmDelete(o => !o),
    onSave: saveCritter,
    editing: animal,
    queryStatus: status
  }

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
  )
}
