import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import Button from 'components/form/Button';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import ConfirmModal from 'components/modal/ConfirmModal';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AssignNewCollarModal from 'pages/data/animals/AssignNewCollar';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { DataLifeInput } from 'types/data_life';
import { canRemoveDeviceFromAnimal } from 'types/permission';
import { formatAxiosError } from 'utils/errors';

import { IAssignmentHistoryPageProps } from './AssignmentHistory';

type IPerformAssignmentActionPageProps = Pick<IAssignmentHistoryPageProps, 'permission_type' | 'critter_id'> & {
  current_attachment: CollarHistory;
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 */
export default function PerformAssignmentAction({
  critter_id,
  current_attachment,
  permission_type
}: IPerformAssignmentActionPageProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const responseDispatch = useResponseDispatch();
  // modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  // is a device being attached or removed?
  const [isLink, setIsLink] = useState(!!current_attachment?.collar_id);
  const [canEdit, setCanEdit] = useState(false);
  /**
   * data life state. passed to both modals for attaching/removing devices
   * if there is no attachment, pass true as second param of DataLifeInput constructor to 
   * default the start datetimes to now
   */
  const [dli, setDli] = useState<DataLifeInput>(new DataLifeInput(dayjs(), dayjs(), null, null));

  /**
   * users with admin/owner permission can attach/unattach devices
   * users with editor permission can only unattach devices
   */
  const determineButtonState = (): boolean => {
    if (canRemoveDeviceFromAnimal(permission_type)) {
      return true;
    }
    if (permission_type === 'editor') {
      return isLink ? false : true;
    }
    return false;
  };

  useDidMountEffect(() => {
    // console.log(`perm: ${permission_type}, islink : ${isLink}`);
    if (current_attachment) {
      setIsLink(!!current_attachment?.collar_id);
      setDli(current_attachment.createDataLife());
    }
  }, [current_attachment]);

  // for critters with no device history, attachment effect above will not occur,
  // so update the assignment button status regardless
  useEffect(() => {
    setCanEdit(determineButtonState());
  })

  // post response handlers
  const onAttachSuccess = (_data: CollarHistory): void => {
    updateStatus({
      severity: 'success',
      message: 'device successfully attached to animal'
    });
    // todo: if device is attached ...update state to indicate that the device can only be removed
    setIsLink((o) => !o);
    closeModals();
  }
  
  const onRemoveSuccess = (_data: CollarHistory): void => updateStatus({
    severity: 'success',
    message: 'device successfully removed from animal'
  });

  const onError = (error: AxiosError): void => {
    updateStatus({
      severity: 'error',
      message: `error ${isLink ? 'attaching' : 'removing'} device: ${formatAxiosError(error)}`
    });
  }

  // 
  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
    updateCollarHistory();
  };

  // force the collar history, current assigned/unassigned critter pages to refetch
  const updateCollarHistory = async (): Promise<void> => {
    console.log('invalidating collar assignment history queries');
    queryClient.invalidateQueries('collarAssignmentHistory');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('critters_assigned');
  };

  // setup mutations to save the device attachment status
  const { mutateAsync: saveAttachDevice } = bctwApi.useAttachDevice({ onSuccess: onAttachSuccess, onError });
  const { mutateAsync: saveRemoveDevice } = bctwApi.useRemoveDevice({ onSuccess: onRemoveSuccess, onError });

  /* if there is a collar attached and user clicks the remove button, show the confirmation window
    otherwise, show the list of devices the user has access to
  */
  const handleClickShowModal = (): void => (isLink ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const handleConfirmRemoveDevice = (): void => {
    const body: RemoveDeviceInput = {
      assignment_id: current_attachment.assignment_id,
      ...dli.toRemoveDeviceJSON()
    }
    saveRemoveDevice(body);
  }

  // componenet passed to the confirm device removal as the modal body.
  const ConfirmRemoval = (
    <>
      <p>{CS.collarRemovalText(current_attachment?.device_id, current_attachment?.device_make)}</p>
      <DataLifeInputForm dli={dli} enableEditEnd={true} enableEditStart={false} />
    </>
  )

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmRemoveDevice}
        handleClose={closeModals}
        open={showConfirmModal}
        message={ConfirmRemoval}
        title={CS.collarRemovalTitle}
      />
      <AssignNewCollarModal
        onSave={saveAttachDevice}
        critter_id={critter_id}
        show={showAvailableModal}
        onClose={closeModals}
        dli={dli}
      />
      {/* <p>permission: {permission_type}</p> */}
      <Button disabled={!canEdit} onClick={handleClickShowModal}>
        {isLink ? 'Remove Device' : 'Assign Device'}
      </Button>
    </>
  );
}
