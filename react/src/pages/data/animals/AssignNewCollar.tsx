import React, { useState } from 'react';
import Button from 'components/form/Button';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import Modal from 'components/modal/Modal';
import Table from 'components/table/Table';
import { availableCollarProps, ICollar } from 'types/collar';
import { eCollarType } from 'api/api_interfaces';
import ErrorMessage from 'components/common/ErrorMessage';

type IAssignNewCollarModal = {
  show: boolean;
  onClose: (close: any) => void;
  onSave: (device: number) => void;
};

/**
 * displays collars that can be assigned to this critter
 * @param {onSave} - parent component {PerformAssignment} handles this
 * collar row must be selected in order to enable the save button
 */
export default function AssignNewCollarModal({ show, onClose, onSave }: IAssignNewCollarModal) {
  const bctwApi = useTelemetryApi();
  const [deviceId, setDeviceId] = useState<number>(0);
  const { isFetching, isLoading, isError, error, resolvedData } = bctwApi.useCollarType(0, eCollarType.Available);
  const handleSelect = (row: ICollar) => setDeviceId(row.device_id);
  return (
    <>
      {isFetching || isLoading ? (
        <p>loading collars...</p>
      ) : isError ? (
        <ErrorMessage message={error.response.data} />
      ) : (
        <Modal open={show} handleClose={onClose}>
          <Table
            onSelect={handleSelect}
            headers={availableCollarProps}
            data={resolvedData}
            title='Assign a collar'
            rowIdentifier='device_id'
          />
          <Button disabled={deviceId === 0} onClick={() => onSave(deviceId)}>
            assign selected collar
          </Button>
        </Modal>
      )}
    </>
  );
}
