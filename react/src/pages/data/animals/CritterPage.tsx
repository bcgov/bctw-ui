import React, { useState } from 'react';
import { ButtonGroup, Button } from '@material-ui/core';
import { useDataStyles } from 'pages/data/data_styles';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { assignedCritterProps, IAnimal, unassignedCritterProps } from 'types/animal';
import EditCritter from 'pages/data/animals/EditCritter';

export default function CritterPage() {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();

  const { isFetching, isLoading, isError, error, resolvedData /*latestData*/ } = bctwApi.useCritters(0);

  const [isEditMode, setEditMode] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<IAnimal>({} as IAnimal);

  const handleClick = (isEdit: boolean) => {
    setEditMode(isEdit);
    setShowModal((o) => !o);
  };
  const handleSelect = (row: IAnimal) => {
    setEditing(row);
  };

  if (isLoading || isFetching) {
    return <div>loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.response?.data ?? error.message}</div>;
  }
  // resolvedData.assigned.forEach(d => console.log(`${d.id}: ${d.calf_at_heel}`));
  return (
    <div className={classes.container}>
      <Table
        onSelect={handleSelect}
        headers={assignedCritterProps}
        data={resolvedData.assigned}
        title='Assigned Animals'
      />
      <Table
        onSelect={handleSelect}
        headers={unassignedCritterProps}
        data={resolvedData.available}
        title='Unassigned Animals'
      />
      <EditCritter
        show={showModal}
        onClose={handleClick}
        isEdit={isEditMode}
        editing={isEditMode ? editing : ({} as IAnimal)}
      />
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={() => handleClick(false)}>add critter</Button>
        <Button onClick={() => handleClick(true)} disabled={Object.keys(editing).length === 0}>
          edit critter
        </Button>
      </ButtonGroup>
    </div>
  );
}
