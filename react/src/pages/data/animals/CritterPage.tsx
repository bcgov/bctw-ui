import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { assignedCritterProps, unassignedCritterProps } from 'types/animal';

const useStyles = makeStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
);

export default function CritterPage() {
  const classes = useStyles();
  const bctwApi = useTelemetryApi();

  const [page, setPage] = React.useState(1);

  const { isLoading, isError, error, resolvedData, latestData, isFetching } = bctwApi.useCritters(page);

  if (isLoading) {
    return (<div>loading...</div>)
  }
  if (isError) {
  return <div>Error: {error?.response?.data ?? error.message}</div>
  }
  return (
    <div className={classes.container}>
      {/* <button onClick={() => setPage((old) => Math.max(old - 1, 0))}>increment</button> */}
      <Table headers={assignedCritterProps} data={resolvedData.assigned} title='Assigned Animals'  />
      <Table headers={unassignedCritterProps} data={resolvedData.available} title='Unassigned Animals'  />
    </div>
  )
}