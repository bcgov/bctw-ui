import React, { useState } from 'react';
import { useMutation } from 'react-query';
import Button from 'components/form/Button';
import { getNow } from 'utils/time';
import { AxiosError } from 'axios';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICollarLinkResult } from 'types/collar';
import ConfirmModal from 'components/modal/ConfirmModal';
import { ErrorMessage } from 'components/common';
import ShowCollarAssignModal from 'pages/data/animals/AssignNewCollar';

type IPerformAssignmentActionProps = {
  hasCollar: boolean;
  animalId: number;
  deviceId: number;
  onPost?: (msg: any) => void;
};
/**
 * component that performs post requests to assign/unassign a collar
 * consists of:
 *  1. a confirmation dialog if user chooses to unassign the collar
 *  2. a modal that displays a list of available collars with a save button
 * @param {onPost} - bubbles up post response to parent handler function
 */
export default function PerformAssignmentAction({
  hasCollar,
  animalId,
  deviceId,
  onPost
}: IPerformAssignmentActionProps) {
  const bctwApi = useTelemetryApi();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);

  const [mutate, { isError, isLoading, isSuccess, error, data }] = useMutation<any, AxiosError>(bctwApi.linkCollar);

  const handleClick = () => (hasCollar ? setShowConfirmModal(true) : setShowAvailableModal(true));

  const closeModals = () => {
    setShowConfirmModal(false);
    setShowAvailableModal(false);
  };

  const createPostBody = (device_id: number, isLink: boolean): any => {
    return {
      isLink,
      data: {
        device_id,
        animal_id: animalId,
        start_date: getNow()
      }
    };
  };

  const assignCollar = async (deviceId: number) => {
    const result: ICollarLinkResult = await mutate(createPostBody(deviceId, true));
    setShowAvailableModal(false);
    notifyParentToast(`collar ${result.device_id} successfully linked to critter ${result.animal_id}`);
  };

  const removeCollar = async () => {
    const result: ICollarLinkResult = await mutate(createPostBody(deviceId, false));
    setShowConfirmModal(false);
    notifyParentToast(`collar ${result.device_id} successfully removed from critter ${result.animal_id}`);
  };

  const notifyParentToast = (msg: string) => {
    if (typeof onPost === 'function') {
      onPost(msg);
    }
  };

  return (
    <>
      <ConfirmModal
        handleClickYes={removeCollar}
        handleClose={closeModals}
        open={showConfirmModal}
        message='Are you sure you wish to unassign this collar?'
        title='Confirm collar unassignment'
      />
      {isError ? <ErrorMessage message={error.response.data} /> : null /* <p>{JSON.stringify(data)}</p> */}
      <ShowCollarAssignModal onSave={assignCollar} show={showAvailableModal} onClose={closeModals} />
      <Button onClick={handleClick}>{hasCollar ? 'unassign collar' : 'assign collar'}</Button>
    </>
  );
}
