import React from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import SelectCode from 'components/form/SelectCode';
import { Typography } from '@material-ui/core';

type IDataPageProps = { }

const DataPage: React.FC<IDataPageProps> = (props) => {
  const bctwApi = useTelemetryApi();
  const { status, data, error } = bctwApi.usePingExtent();
  return (
    <>
      {
        status === 'loading' ? ('loading...')
        : status === 'error' ? (<span>Error: {error?.message || ''}</span>)
        : (
          <>
            <Typography align='center'  variant='h6'>Data Management</Typography>
            <p>max: {data.max}</p>
            <p>min: {data.min}</p>
          </>
        )
      }
      <SelectCode label='Region' codeHeader='region' val=''/>
    </>
  )
}

export default DataPage;