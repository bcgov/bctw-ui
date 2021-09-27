import { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import DataTable from 'components/table/DataTable';
import { Collar, eCollarAssignedStatus } from 'types/collar';
import { CritterStrings as CS } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import DataLifeInputForm from 'components/form/DataLifeInputForm';
import { AttachDeviceInput } from 'types/collar_history';
import { Animal } from 'types/animal';
import { DataLifeInput } from 'types/data_life';

type IAssignNewCollarModal = Pick<Animal, 'critter_id'> & {
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (obj: AttachDeviceInput ) => void;
  dli: DataLifeInput;
};

/**
 * Displays devices that can be assigned to this animal
 * accessed from @function PerformAssignmentAction component
 * @param {onSave} - parent component {PerformAssignment} handles this.
 * collar row must be selected in order to enable the save button
 */
export default function AssignNewCollarModal({ critter_id, dli, onClose, show, onSave }: IAssignNewCollarModal): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [collarId, setCollarId] = useState<string>('');
  const [ DLInput ] = useState<DataLifeInput>(dli);

  const handleSelectDevice = (row: Collar): void => setCollarId(row.collar_id);

  const handleSave = (): void => {
    const body: AttachDeviceInput = {
      critter_id,
      collar_id: collarId,
      // formats the datetime properties
      ...DLInput.toPartialAttachDeviceJSON()
    }
    onSave(body);
  }

  return (
    <>
      <Modal open={show} handleClose={onClose}>
        <DataTable
          headers={Collar.propsToDisplay}
          title={CS.collarAssignmentTitle}
          queryProps={{ query: bctwApi.useUnattachedDevices, param: eCollarAssignedStatus.Available }}
          onSelect={handleSelectDevice}
        />
        {/* disable editing of end of the attachment when attaching the device */}
        <DataLifeInputForm dli={DLInput} enableEditStart={true} enableEditEnd={false} />
        <Button disabled={collarId === ''} onClick={handleSave}>
          {CS.assignCollarBtnText}
        </Button>
      </Modal>
    </>
  );
}
