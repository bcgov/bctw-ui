import { ICollarLinkPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ConfirmModal from 'components/modal/ConfirmModal';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ShowCollarAssignModal from 'pages/data/animals/AssignNewCollar';
import { useEffect } from 'react';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { CollarHistory } from 'types/collar_history';
import { formatAxiosError } from 'utils/common';
import { getNow } from 'utils/time';

type IPerformAssignmentActionProps = {
  animalId: string;
  collarId: string; // uuid of the attached collar
  canEdit: boolean; // does user have change permission?
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 */
export default function PerformAssignmentAction({
  animalId,
  collarId,
  canEdit
}: IPerformAssignmentActionProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);
  //  state to manage if a collar is being linked or removed
  const [isLink, setIsLink] = useState<boolean>(!!collarId);
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data: CollarHistory): void => {
    updateStatus({
      type: 'success',
      message: `device ${data.collar_id} successfully ${isLink ? 'linked to' : 'removed from'} critter`
    });
    setIsLink(o => !o);
  };

  const onError = (error: AxiosError): void =>
    updateStatus({
      type: 'error',
      message: `error ${isLink ? 'linking' : 'removing'} device: ${formatAxiosError(error)}`
    });

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
    updateCollarHistory();
  };

  useEffect(() => {
    // update status when collarId prop updated from parent
    // fixme: why isn't this be happening automatically?
    setIsLink(!!collarId);
  }, [collarId])

  // force the collar history, current assigned/unassigned critter pages to refetch
  const updateCollarHistory = async(): Promise<void> => {
    queryClient.invalidateQueries('collarAssignmentHistory');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('critters_assigned');
  }

  const { mutateAsync } = bctwApi.useMutateLinkCollar({ onSuccess, onError });

  const handleClickShowModal = (): void => (isLink ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const save = async (collar_id: string, isAssign: boolean): Promise<void> => {
    await setIsLink(isAssign);
    isAssign ? setShowAvailableModal(false) : setShowConfirmModal(false);
    const now = getNow();
    const payload: ICollarLinkPayload = {
      isLink: isAssign,
      data: {
        collar_id,
        animal_id: animalId,
      }
    };
    if (isAssign) {
      payload.data.valid_from = now;
    } else {
      payload.data.valid_to = now;
    }
    await mutateAsync(payload);
  };

  return (
    <>
      <ConfirmModal
        handleClickYes={(): Promise<void> => save(collarId, false)}
        handleClose={closeModals}
        open={showConfirmModal}
        message={CS.collarRemovalText}
        title={CS.collarRemovalTitle}
      />
      <ShowCollarAssignModal
        onSave={(id): Promise<void> => save(id, true)}
        show={showAvailableModal}
        onClose={closeModals}
      />
      <Button disabled={!canEdit} onClick={handleClickShowModal}>{isLink ? 'remove device' : 'assign device' }</Button>
    </>
  );
}
