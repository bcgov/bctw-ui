import { Animal, AttachedAnimal } from 'types/animal';
import { cloneElement, useState, useEffect } from 'react';
import { permissionCanModify  } from 'types/permission';
import { useQueryClient } from 'react-query';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';

type IModifyWrapperProps = {
  editing: Animal | AttachedAnimal;
  children: JSX.Element;
};

/**
 * wraps child components to provide the actual POST request endpoints for the animal 
 * includes editing and deletes
 */
export default function ModifyCritterWrapper(props: IModifyWrapperProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const { editing, children } = props;
  const [canEdit, setCanEdit] = useState(false);
  const [hasCollar, setHasCollar] = useState(false);
  const [show, setShow] = useState(false);

  // must be defined before mutation declarations
  const onSaveSuccess = async (data: IBulkUploadResults<Animal>): Promise<void> => {
    const { errors, results } = data;
    if (errors.length) {
      responseDispatch({ severity: 'error', message: `${errors.map(e => e.error)}` });
    } else {
      const critter = results[0];
      responseDispatch({ severity: 'success', message: `${critter.animal_id} saved!` });
      invalidateCritterQueries();
    }
  };

  const onDeleteSuccess = async (): Promise<void> => {
    responseDispatch({ severity: 'success', message: `critter deleted successfully` });
    invalidateCritterQueries();
  };

  const onError = (error: AxiosError): void => responseDispatch({ severity: 'error', message: formatAxiosError(error) });

  // force refetch on critter queries
  const invalidateCritterQueries = async (): Promise<void> => {
    queryClient.invalidateQueries('critters_assigned');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('getType');
    queryClient.invalidateQueries('pings');
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCritter({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveCritter = async (a: IUpsertPayload<Animal>): Promise<void> => {
    const { body } = a;
    const formatted = body.toJSON();
    console.log('ModifyCritterWrapper: saving animal ', JSON.stringify(formatted, null, 2));
    await saveMutation({ body: formatted});
  } 

  const deleteCritter = async (critterId: string): Promise<void> => {
    const payload: IDeleteType = {
      id: critterId,
      objType: 'animal'
    };
    await deleteMutation(payload);
  };

  useEffect(() => {
    const upd = (): void => {
      setHasCollar(props.editing instanceof AttachedAnimal)
      setCanEdit(permissionCanModify(editing?.permission_type));
    }
    upd();
  }, [editing]);

  const deleteMessage = ():string => {
    const base = hasCollar ? `CAREFUL! Performing this action will remove the collar ${(editing as AttachedAnimal)?.device_id} from this animal. ` : '';
    return `${base}This will prevent other users from seeing this critter. Are you sure you want to delete ${editing?.name}?`
  }

  const handleDeleteButtonClicked = (): void => {
    setShow(o=> !o);
  }

  const handleConfirmDelete = (): void => {
    deleteCritter(editing?.critter_id)
    setShow(false);
  }
  
  const validateFailed = (errors: Record<string, unknown>): void => {
    responseDispatch({ severity: 'error', message: `missing required fields: ${Object.keys(errors).join(', ')}` });
  }

  // pass the permission_type down so the AddEditViewer can set the edit/view button status
  const passTheseProps = {
    cannotEdit: !canEdit,
    onDelete: handleDeleteButtonClicked,
    onSave: saveCritter,
    validateFailed
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
