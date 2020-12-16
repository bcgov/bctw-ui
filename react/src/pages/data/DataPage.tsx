import React from 'react';
import { Typography } from '@material-ui/core';
// import SelectCode from 'components/form/SelectCode';

type IDataPageProps = { }

const DataPage: React.FC<IDataPageProps> = (props) => {
  return (
    <>
      <Typography align='center'  variant='h6'>Data Management</Typography>
      {/* <SelectCode label='Region' codeHeader='region' val=''/> */}
    </>
  )
}

export default DataPage;