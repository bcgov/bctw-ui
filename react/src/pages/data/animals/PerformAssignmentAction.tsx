import { ICollarLinkPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import Button from 'components/form/Button';
import ConfirmModal from 'components/modal/ConfirmModal';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ShowCollarAssignModal from 'pages/data/animals/AssignNewCollar';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { CollarHistory } from 'types/collar_history';
import { formatAxiosError } from 'utils/common';
import { getNow } from 'utils/time';

type IPerformAssignmentActionProps = {
  animalId: string;
  collarId: string; // uuid of the attached collar
  canEdit: boolean; // does user have change permission?
  hasCollar: boolean; // does the critter currently have a collar attached
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 */
export default function PerformAssignmentAction({
  hasCollar,
  animalId,
  collarId,
  canEdit
}: IPerformAssignmentActionProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);
  //  state to manage if a collar is being linked or removed
  const [isLink, setIsLink] = useState<boolean>(false);
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data: CollarHistory): void => {
    updateStatus({
      type: 'success',
      message: `device ${data.collar_id} successfully ${isLink ? 'linked to' : 'removed from'} critter`
    });
  };

  const onError = (error: AxiosError): void =>
    updateStatus({
      type: 'error',
      message: `error ${isLink ? 'linking' : 'removing'} collar: ${formatAxiosError(error)}`
    });

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
    updateCollarHistory();
  };

  // force the collar history, current assigned/unassigned critter pages to refetch
  const updateCollarHistory = (): Promise<unknown> =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0] as string;
        const includes = ['collarAssignmentHistory', 'u_critters', 'a_critters'].includes(key);
        return includes;
      }
    });

  const { mutateAsync } = (bctwApi.useMutateLinkCollar as any)({ onSuccess, onError });

  const handleClickShowModal = (): void => (hasCollar ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const save = async (id: string, isAssign: boolean): Promise<void> => {
    await setIsLink(isAssign);
    isAssign ? setShowAvailableModal(false) : setShowConfirmModal(false);
    const payload: ICollarLinkPayload = {
      isLink: isAssign,
      data: {
        collar_id: id,
        animal_id: animalId,
        valid_from: getNow()
      }
    };
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
      <Button disabled={!canEdit} onClick={handleClickShowModal}>{hasCollar ? 'unassign collar' : 'assign collar'}</Button>
    </>
  );
}
