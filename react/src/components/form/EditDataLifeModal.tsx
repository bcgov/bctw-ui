import { useState } from 'react';
import { CollarHistory } from 'types/collar_history';
import { ModalBaseProps } from 'components/component_interfaces';
import { Modal } from 'components/common';
import DataLifeInputForm from './DataLifeInputForm';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import Button from './Button';
import { Box } from '@material-ui/core';
import { DataLifeInput, IChangeDataLifeProps } from 'types/data_life';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';
import { eCritterPermission } from 'types/permission';

type EditDataLifeModalProps = ModalBaseProps & {
  attachment: CollarHistory;
  permission_type: eCritterPermission;
};

/**
 * modal form that wraps @function DataLifeInputForm for modifying a device attachment data life
 * note: integrate this with @function EditModal ?
 */
export default function EditDataLifeModal(props: EditDataLifeModalProps): JSX.Element {
  const { attachment, open, handleClose, permission_type } = props;
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [canSave, setCanSave] = useState<boolean>(false);
  const [dli, setDli] = useState<DataLifeInput>(new DataLifeInput(attachment));

  useDidMountEffect(() => {
    // console.log('new attachment provided to DL modal', attachment.assignment_id)
    setDli(new DataLifeInput(attachment));
  }, [attachment]);

  // must be defined before mutation declarations
  const onSuccess = async (data): Promise<void> => {
    console.log('data life updated response:', data);
    responseDispatch({ severity: 'success', message: `data life updated` });
  };

  const onError = async (err): Promise<void> => {
    responseDispatch({ severity: 'error', message: `data life failed to update: ${formatAxiosError(err)}` });
  };

  const handleSave = async (): Promise<void> => {
    const body: IChangeDataLifeProps = {
      assignment_id: attachment.assignment_id,
      ...dli.toPartialEditDatalifeJSON()
    };
    await mutateAsync(body);
    handleClose(false);
  };

  // setup mutation to save the modified data life
  const { mutateAsync } = bctwApi.useMutateEditDataLife({ onSuccess, onError });
  const isAdmin = permission_type === eCritterPermission.admin;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={`Edit Data Life for ${attachment.device_make} Device ${attachment.device_id}`}>
      <div>
        {/* enable data life end fields only if the current attachment is expired/invalid */}
        <DataLifeInputForm
          onChange={(): void => setCanSave(true)}
          disableEditActual={true} // always disable editing the actual start/end fields in this modal
          enableEditStart={true} 
          // can only edit the end fields if this attachment is expired
          enableEditEnd={!!attachment.valid_to} 
          // admin privileged users can always edit DL dates
          disableDLStart={isAdmin ? false : !new DataLifeInput(attachment).canChangeDLStart}
          disableDLEnd={isAdmin ? false : !new DataLifeInput(attachment).canChangeDLEnd}
          dli={dli}
        />
        {/* the save button */}
        <Box display='flex' justifyContent='flex-end'>
          <Button size='large' onClick={(): void => handleClose(false)}>Cancel</Button>
          <Button disabled={!canSave} size='large' color='primary' onClick={handleSave}>Save</Button>
        </Box>
      </div>
    </Modal>
  );
}
