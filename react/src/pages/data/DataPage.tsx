import React from 'react';
import { Typography } from '@material-ui/core';

type IDataPageProps = { }

const DataPage: React.FC<IDataPageProps> = (props) => {
  return (
    <>
      <Typography align='center'  variant='h6'>Data Management</Typography>
    </>
  )
}

export default DataPage;