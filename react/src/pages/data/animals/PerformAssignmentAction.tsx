import { AxiosError } from 'axios';
import { Button } from 'components/common';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import ConfirmModal from 'components/modal/ConfirmModal';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AssignNewCollarModal from 'pages/data/animals/AssignNewCollar';
import { useEffect, useState } from 'react';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { DataLifeInput } from 'types/data_life';
import { canRemoveDeviceFromAnimal } from 'types/permission';
import { formatAxiosError } from 'utils/errors';

import { IAssignmentHistoryPageProps } from './AssignmentHistory';

type IPerformAssignmentActionPageProps = Pick<IAssignmentHistoryPageProps, 'permission_type' | 'critter_id'> & {
  current_attachment: CollarHistory;
};
/**
 * handles attaching/removing devices from animals. Contains:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 */
export default function PerformAssignmentAction({
  critter_id,
  current_attachment,
  permission_type
}: IPerformAssignmentActionPageProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [showConfirmUnattachModal, setShowConfirmModal] = useState(false);
  const [showDevicesAvailableModal, setShowAvailableModal] = useState(false);
  // is a device being attached or removed?
  const [isRemovingDevice, setIsRemovingDevice] = useState(!!current_attachment?.collar_id);
  const [canEdit, setCanEdit] = useState(false);
  const now = dayjs();
  /**
   * data life state. passed to both modals for attaching/removing devices
   * if there is no attachment, pass true as second param of DataLifeInput constructor to
   * default the start datetimes to now
   */
  const [dli, setDli] = useState<DataLifeInput>(
    new DataLifeInput(now, now, isRemovingDevice ? now : null, isRemovingDevice ? now : null)
  );

  /**
   * users with admin/owner permission can attach/unattach devices
   * users with editor permission can only unattach devices
   */
  const determineButtonState = (): boolean => {
    if (canRemoveDeviceFromAnimal(permission_type)) {
      return true;
    }
    if (permission_type === 'editor') {
      return isRemovingDevice ? false : true;
    }
    return false;
  };

  // update data life class when the existing attachment is loaded
  useDidMountEffect(() => {
    if (current_attachment) {
      const isRemoving = !!current_attachment?.collar_id;
      setIsRemovingDevice(isRemoving);
      setDli((o) => {
        const { attachment_start, data_life_start } = current_attachment;
        if (isRemoving) {
          return new DataLifeInput(attachment_start, data_life_start, now, now);
        } else {
          return new DataLifeInput(attachment_start, data_life_start, null, null);
        }
      });
    }
  }, [current_attachment]);

  // for critters with no device history, attachment effect above will not occur,
  // so update the assignment button status regardless
  useEffect(() => {
    setCanEdit(determineButtonState());
  });

  // post response handlers
  const onAttachSuccess = (): void => {
    showNotif({ severity: 'success', message: 'device successfully attached to animal' });
    // todo: if device is attached ...update state to indicate that the device can only be removed
    setIsRemovingDevice((o) => !o);
    closeModals();
  };

  const onRemoveSuccess = (): void => {
    showNotif({ severity: 'success', message: 'device successfully removed from animal' });
    closeModals();
  };

  const onError = (error: AxiosError): void =>
    showNotif({
      severity: 'error',
      message: `error ${isRemovingDevice ? 'attaching' : 'removing'} device: ${formatAxiosError(error)}`
    });

  // setup mutations to save the device attachment status
  const { mutateAsync: saveAttachDevice } = api.useAttachDevice({ onSuccess: onAttachSuccess, onError });
  const { mutateAsync: saveRemoveDevice } = api.useRemoveDevice({ onSuccess: onRemoveSuccess, onError });

  /* if there is a collar attached and user clicks the remove button, show the confirmation window
    otherwise, show the list of devices the user has access to
  */
  const handleClickShowModal = (): void => (isRemovingDevice ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const handleConfirmRemoveDevice = (): void => {
    const body: RemoveDeviceInput = {
      assignment_id: current_attachment.assignment_id,
      ...dli.toRemoveDeviceJSON()
    };
    saveRemoveDevice(body);
  };

  // componenet passed to the confirm device removal as the modal body.
  const ConfirmRemoval = (
    <>
      <p>{CS.collarRemovalText(current_attachment?.device_id, current_attachment?.device_make)}</p>
      <DataLifeInputForm dli={dli} enableEditEnd={true} enableEditStart={false} />
    </>
  );

  return (
    <>
      <ConfirmModal
        handleClickYes={handleConfirmRemoveDevice}
        handleClose={closeModals}
        open={showConfirmUnattachModal}
        message={ConfirmRemoval}
        title={CS.collarRemovalTitle}
      />
      <AssignNewCollarModal
        onSave={saveAttachDevice}
        critter_id={critter_id}
        show={showDevicesAvailableModal}
        onClose={closeModals}
        dli={dli}
      />
      <Button disabled={!canEdit} onClick={handleClickShowModal}>
        {isRemovingDevice ? 'Remove Device' : 'Assign Device'}
      </Button>
    </>
  );
}
