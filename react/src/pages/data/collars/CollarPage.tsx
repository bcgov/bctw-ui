import React from 'react';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useDataStyles } from 'pages/data/common/data_styles';
import { assignedCollarProps, availableCollarProps } from 'types/collar';

export default function CollarPage() {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();
  const rowId = 'device_id';

  const { isFetching, isLoading, isError, error, resolvedData /*latestData*/ } = bctwApi.useCollars(0);

  const handleSelect = () => {
  }

  if (isLoading || isFetching) {
    return <div>loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.response?.data ?? error.message}</div>;
  }
  return (
    <div className={classes.container}>
      <Table
        onSelect={handleSelect}
        headers={assignedCollarProps}
        data={resolvedData.assigned}
        title='Assigned Collars'
        rowIdentifier={rowId}
      />
      <Table
        onSelect={handleSelect}
        headers={availableCollarProps}
        data={resolvedData.available}
        title='Unassigned Collars'
        rowIdentifier={rowId}
      />
      </div>
  )
}