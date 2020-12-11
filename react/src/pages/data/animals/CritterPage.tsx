import React, { useState, useEffect } from 'react';
import { makeStyles, ButtonGroup, Button } from '@material-ui/core';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { assignedCritterProps, IAnimal, unassignedCritterProps } from 'types/animal';
import EditCritter from 'pages/data/animals/EditCritter';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButtonRow: {
    '& > button': {
      marginRight: '20px'
    }
  }
});

export default function CritterPage() {
  const classes = useStyles();
  const bctwApi = useTelemetryApi();
  const { isLoading, isError, error, resolvedData, latestData, isFetching } = bctwApi.useCritters(0);

  const [isEditMode, setEditMode] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<IAnimal>({} as IAnimal);
  const handleClick = (isEdit: boolean) => {
    setEditMode(isEdit);
    setShowModal((o) => !o);
  };
  const handleSelect = (row: IAnimal) => setEditing(row);

  if (isLoading) {
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
      <EditCritter show={showModal} onClose={handleClick} isEdit={isEditMode} editing={isEditMode ? editing : {} as IAnimal} />
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={() => handleClick(false)}>add critter</Button>
        <Button onClick={() => handleClick(true)} disabled={Object.keys(editing).length === 0}>
          edit critter
        </Button>
      </ButtonGroup>
    </div>
  );
}
