import React, { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Typography } from '@material-ui/core';
import { hasCollarCurrentlyAssigned } from 'types/collar';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { ErrorMessage } from 'components/common';

type IAssignmentHistoryProps = {
  animalId: number;
  deviceId?: number;
  onPost: (msg: any) => void;
};

/**
 *  displays a table with collar history and nests
 *  all of the collar assign/unassign handling components
 * @param onPost - bubble this event to {EditCritter} parent
 * @param animalId - {EditCritter}s animal id
 */
export default function AssignmentHistory(props: IAssignmentHistoryProps) {
  const { animalId } = props;
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const bctwApi = useTelemetryApi();
  const { isLoading, isError, isFetching, error, data } = bctwApi.useCollarHistory(animalId);

  const handleSelect = () => {};

  useEffect(() => {
    const u = () => {
      if (data && data.length) {
        setHasCollar(hasCollarCurrentlyAssigned(data));
      }
    };
    u();
  }, [data]);

  // instantiate this component here as we want to display the add collar
  // option if the critter has no collar history
  const assignment = <PerformAssignmentAction deviceId={data?.length ? data[0].device_id : 0} hasCollar={hasCollar} {...props} />;
  return (
    <>
      {isLoading || isFetching ? (
        <div>loading collar assignment details...</div>
      ) : isError ? (
        <ErrorMessage message={`error ${error.response.data}`} />
      ) : !data.length ? (
        assignment
      ) : (
        <>
          <Typography variant='h6'>Collar Assignment History</Typography>
          <Table
            onSelect={handleSelect}
            headers={['device_id', 'make', 'start_time', 'end_time']}
            data={data}
            rowIdentifier='device_id'
          />
          {assignment}
        </>
      )}
    </>
  );
}
