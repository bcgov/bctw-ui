import React from 'react';
import DenseTable from 'components/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { QueryStatus } from 'react-query';

import { makeStyles, Theme } from '@material-ui/core/styles';

const critterProps = ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id'];

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
  const { status, data, error } = bctwApi.useCritters();

  if (status === QueryStatus.Loading) {
    return (<div>loading...</div>)
  }
  if (status === QueryStatus.Error) {
  return <div>Error: {error?.response?.data ?? error.message}</div>
  }
  return (
    <div className={classes.container}>
      <DenseTable headers={critterProps} data={data.assigned} title='Assigned Animals'  />
      <DenseTable headers={critterProps} data={data.available} title='Unassigned Animals'  />
    </div>
  )
}