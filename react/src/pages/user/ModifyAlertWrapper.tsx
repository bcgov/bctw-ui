import { Animal } from 'types/animal';
import { cloneElement, useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/common';
import { IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { ITelemetryAlert, ITelemetryAlertInput } from 'types/alert';
import { UserAlertStrings } from 'constants/strings';

type ModifyAlertWrapperProps = {
  alert: ITelemetryAlert;
  children: JSX.Element;
};

// wraps the AddEditViewer to provide additional critter/user-specific functionality
export default function ModifyAlertWrapper(props: ModifyAlertWrapperProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const { alert, children } = props;
  const [showConfirmDismiss, setShowConfirmDismiss] = useState<boolean>(false);

  // must be defined before mutation declarations
  const onSaveSuccess = async (data: IBulkUploadResults<Animal>): Promise<void> => {
    // const { errors, results } = data;
    // if (errors.length) {
    //   responseDispatch({ type: 'error', message: `${errors.map(e => e.error)}` });
    // } else {
    //   const critter = results[0];
    //   responseDispatch({ type: 'success', message: `${critter.animal_id} saved!` });
    //   invalidateCritterQueries();
    // }
  };

  const onDismissSuccess = async (): Promise<void> => {
    queryClient.invalidateQueries('userAlert');
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCritter({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: dismissAlertMutation } = bctwApi.useMutateUserAlert({ onSuccess: onDismissSuccess, onError });

  const saveCritter = async (a: IUpsertPayload<Animal>): Promise<IBulkUploadResults<Animal>> => {
    console.log('save critter', a);
    return null
    // return await saveMutation(a);
  }
  const dismissAlert = async (id: number): Promise<void> => {
    const payload: ITelemetryAlertInput = {
      alert_id: [id],
      alert_action: 'dismiss',
    };
    await dismissAlertMutation(payload);
  };

  const handleConfirmDelete = (): void => {
    dismissAlert(alert.alert_id)
    setShowConfirmDismiss(false);
  }

  const passTheseProps = {
    onDelete: ():void => setShowConfirmDismiss(true),
    onSave: saveCritter,
  }

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmDelete}
        handleClose={(): void => setShowConfirmDismiss(false)}
        open={showConfirmDismiss}
        message={UserAlertStrings.dimissAlert}
      />
      {cloneElement(children, passTheseProps)}
    </>
  )
}
