import React from 'react';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Button, ButtonGroup, Typography } from '@material-ui/core';
import { hasCollarCurrentlyAssigned } from 'types/collar';

type IAssignmentHistoryProps = {
  animalId: number;
  isEdit: boolean;
};

export default function AssignmentHistory({animalId}: IAssignmentHistoryProps) {
  const bctwApi = useTelemetryApi();
  const { isLoading, isError, isFetching, error, data } = bctwApi.useCollarHistory(animalId);

  const handleSelect = () => {};
  const handleAssign = () => {};

  if (isLoading || isFetching) {
    return <div>loading collar assignment details...</div>
  } else if (isError) {
    return <div>{`error ${error.response.data}`}</div>
  }
  return (
    <>
      <Typography variant='h6'>Collar Assignment History</Typography>
      <Table
        onSelect={handleSelect}
        headers={['device_id', 'make', 'start_time', 'end_time']}
        data={data}
      />
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleAssign}>{hasCollarCurrentlyAssigned(data) ? 'unassign collar' : 'assign collar'}</Button>
      </ButtonGroup>
    </>
  )
}
