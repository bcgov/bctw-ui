import { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import Table from 'components/table/Table';
import { availableCollarProps, ICollar } from 'types/collar';
import { eCollarType } from 'api/api_interfaces';
import { CritterStrings as CS } from 'constants/strings';

type IAssignNewCollarModal = {
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (device: number) => void;
};

/**
 * displays collars that can be assigned to this critter
 * @param {onSave} - parent component {PerformAssignment} handles this
 * collar row must be selected in order to enable the save button
 */
export default function AssignNewCollarModal({ show, onClose, onSave }: IAssignNewCollarModal): JSX.Element {
  const [collarId, setCollarId] = useState<number>(0);
  const handleSelect = (row: ICollar): void => setCollarId(row.collar_id);

  return (
    <>
      <Modal open={show} handleClose={onClose}>
        <Table
          headers={availableCollarProps}
          title={CS.collarAssignmentTitle}
          rowIdentifier='collar_id'
          queryProps={{ query: 'useCollarType', queryParam: eCollarType.Available }}
          onSelect={handleSelect}
        />
        <Button disabled={collarId === 0} onClick={(): void => onSave(collarId)}>{CS.assignCollarBtnText}</Button>
      </Modal>
    </>
  );
}
