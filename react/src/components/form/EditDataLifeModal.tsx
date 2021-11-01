import { useState } from 'react';
import { CollarHistory } from 'types/collar_history';
import { ModalBaseProps } from 'components/component_interfaces';
import { Button, Modal } from 'components/common';
import DataLifeInputForm from './DataLifeInputForm';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { Box } from '@mui/material';
import { DataLifeInput, ChangeDataLifeInput } from 'types/data_life';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';
import { eCritterPermission } from 'types/permission';
import { isDev } from 'api/api_helpers';

type EditDataLifeModalProps = ModalBaseProps & {
  attachment: CollarHistory;
  permission_type: eCritterPermission;
};

/**
 * modal form that wraps @function DataLifeInputForm for modifying a device attachment data life
 */
export default function EditDataLifeModal(props: EditDataLifeModalProps): JSX.Element {
  const { attachment, open, handleClose, permission_type } = props;
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  const [canSave, setCanSave] = useState(false);
  const [dli, setDli] = useState<DataLifeInput>(attachment.createDataLife());

  useDidMountEffect(() => {
    if (attachment) {
      // console.log('new attachment provided to DL modal', attachment.assignment_id)
      setDli(attachment.createDataLife());
    }
  }, [attachment]);

  // must be defined before mutation declarations
  const onSuccess = async (data): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log('data life updated response:', data);
    showNotif({ severity: 'success', message: `data life updated` });
  };

  const onError = async (err): Promise<void> => {
    showNotif({ severity: 'error', message: `data life failed to update: ${formatAxiosError(err)}` });
  };

  const handleSave = async (): Promise<void> => {
    const body: ChangeDataLifeInput = {
      assignment_id: attachment.assignment_id,
      ...dli.toPartialEditDatalifeJSON()
    };
    await mutateAsync(body);
    handleClose(false);
  };

  const getTitle = (): string => {
    const s = `Edit Data Life for ${attachment.device_make} Device ${attachment.device_id}`; 
    return + isDev()
      ? `${s} assignment ID: ${attachment.assignment_id}`
      : s;
  };

  // setup mutation to save the modified data life
  const { mutateAsync } = api.useEditDataLife({ onSuccess, onError });
  const isAdmin = permission_type === eCritterPermission.admin;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={getTitle()}>
      <div>
        <DataLifeInputForm
          onChange={(): void => setCanSave(true)}
          // always disable editing the actual start/end fields in this modal
          disableEditActual={true}
          enableEditStart={true}
          // can only edit the end fields if this attachment is expired, (not null or invalid)
          enableEditEnd={attachment?.data_life_end?.isValid()}
          // admin privileged users can always edit DL dates
          disableDLStart={isAdmin ? false : !dli.canChangeDLStart}
          disableDLEnd={isAdmin ? false : !dli.canChangeDLEnd}
          dli={dli}
        />
        <Box display='flex' columnGap={1} justifyContent='flex-end'>
          <Button disabled={!canSave} onClick={handleSave}>Save</Button>
          <Button variant='outlined' onClick={(): void => handleClose(false)}>Cancel</Button>
        </Box>
      </div>
    </Modal>
  );
}
