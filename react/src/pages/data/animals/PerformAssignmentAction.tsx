import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ConfirmModal from 'components/modal/ConfirmModal';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ShowCollarAssignModal from 'pages/data/animals/AssignNewCollar';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { CollarHistory, ICollarLinkPayload } from 'types/collar_history';
import { canRemoveDeviceFromAnimal } from 'types/permission';
import { formatAxiosError } from 'utils/errors';
import { getNow } from 'utils/time';
import { IAssignmentHistoryProps } from './AssignmentHistory';

type IPerformAssignmentActionProps = Pick<IAssignmentHistoryProps, 'critter_id' | 'permission_type'> & {
  collar_id: string;
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 */
export default function PerformAssignmentAction({
  critter_id,
  collar_id,
  permission_type
}: IPerformAssignmentActionProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);
  // state to manage if a collar is being linked or removed
  const [isLink, setIsLink] = useState<boolean>(!!collar_id);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const responseDispatch = useResponseDispatch();

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
    setIsLink(!!collar_id);
    setCanEdit(determineButtonState());
  }, [collar_id, critter_id]);

  const onSuccess = (data: CollarHistory): void => {
    updateStatus({
      severity: 'success',
      message: `device ${data.collar_id} successfully ${isLink ? 'linked to' : 'removed from'} critter`
    });
    setIsLink((o) => !o);
  };

  const onError = (error: AxiosError): void =>
    updateStatus({
      severity: 'error',
      message: `error ${isLink ? 'linking' : 'removing'} device: ${formatAxiosError(error)}`
    });

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
    updateCollarHistory();
  };

  // force the collar history, current assigned/unassigned critter pages to refetch
  const updateCollarHistory = async (): Promise<void> => {
    queryClient.invalidateQueries('collarAssignmentHistory');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('critters_assigned');
  };

  // setup the mutation
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
      data: { collar_id, critter_id }
    };
    if (isAssign) {
      // todo:
      // if attaching the collar, set the start of the animal/device relationship to now
      payload.data.valid_from = now;
    } else {
      // otherwise - set the end of the relationship to now
      payload.data.valid_to = now;
    }
    await mutateAsync(payload);
  };

  return (
    <>
      <ConfirmModal
        handleClickYes={(): Promise<void> => save(collar_id, false)}
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
      <Button disabled={!canEdit} onClick={handleClickShowModal}>
        {isLink ? 'remove device' : 'assign device'}
      </Button>
    </>
  );
}
