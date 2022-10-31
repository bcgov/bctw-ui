import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import { Collar, eCollarAssignedStatus } from 'types/collar';
import { CritterStrings as CS } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import { AttachDeviceInput } from 'types/collar_history';
import { Animal } from 'types/animal';
import { DataLifeInput } from 'types/data_life';
import { Button, Modal } from 'components/common';
import { MutationStatus } from 'react-query';
import { Box, CircularProgress } from '@mui/material';

type IAssignNewCollarModal = Pick<Animal, 'critter_id'> & {
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (obj: AttachDeviceInput) => void;
  dli: DataLifeInput;
  saveStatus: MutationStatus;
};

/**
 * Displays devices that can be assigned to this animal
 * accessed from @function PerformAssignmentAction component
 * @param {onSave} - parent component {PerformAssignment} handles this.
 * collar row must be selected in order to enable the save button
 */
export default function AssignNewCollarModal({
  critter_id,
  dli,
  onClose,
  show,
  onSave,
  saveStatus
}: IAssignNewCollarModal): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [selectedDevice, setSelectedDevice] = useState<Collar>({} as Collar);
  const [DLInput] = useState<DataLifeInput>(dli);

  const handleSelectDevice = (row: Collar): void => setSelectedDevice(row);

  const handleSave = (): void => {
    // todo: use device id to display more useful notification after save
    const { collar_id, device_id } = selectedDevice;
    const body: AttachDeviceInput = {
      critter_id,
      collar_id: collar_id,
      device_id: device_id,
      // formats the datetime properties
      ...DLInput.toPartialAttachDeviceJSON()
    };
    onSave(body);
  };

  return (
    <Modal open={show} handleClose={onClose}>
      <DataTable
        headers={Collar.propsToDisplay}
        title={CS.collarAssignmentTitle}
        queryProps={{ query: bctwApi.useUnattachedDevices, param: eCollarAssignedStatus.Available }}
        onSelect={handleSelectDevice}
        disableSearch
      />
      {/* disable editing of end of the attachment when attaching the device */}
      {/* <DataLifeInputForm dli={DLInput} enableEditStart={true} enableEditEnd={false} /> */}
      <Box>
        {saveStatus === 'loading' ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          <Button disabled={Object.keys(selectedDevice).length === 0} onClick={handleSave}>
            {CS.assignCollarBtnText}
          </Button>
        )}
      </Box>
    </Modal>
  );
}
