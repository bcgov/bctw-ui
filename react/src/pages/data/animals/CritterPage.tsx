import React, { useState } from 'react';
import { useDataStyles } from 'pages/data/data_styles';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Animal, assignedCritterProps, IAnimal, unassignedCritterProps } from 'types/animal';
import EditModal from 'pages/data/animals/EditCritter';
import { Toast } from 'components/common';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/AddEditViewer';
import { useMutation } from 'react-query';
import { AxiosError } from 'axios';

export default function CritterPage() {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();

  const { isFetching, isLoading, isError, error, resolvedData /*latestData*/ } = bctwApi.useCritters(0);

  const [mutate] = useMutation<IAnimal[], AxiosError>(bctwApi.upsertCritter);

  const [editObj, setEditObj] = useState<IAnimal>({} as IAnimal);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const editableProps = [
    'nickname',
    'animal_id',
    'wlh_id',
    'species',
    'region',
    'population_unit',
    'animal_status',
    'calf_at_heel'
  ];
  const selectableProps = editableProps.slice(3, 7);

  const handleToast = (msg: any) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const handleSelect = (row: IAnimal) => {
    setEditObj(row);
  };

  const handleSave = async (o: any) => {
    const result: IAnimal[] = await mutate(o);
    if (Array.isArray(result)) {
      const critter = result[0];
      handleToast(`${critter?.animal_id ?? critter?.nickname ?? 'critter'} saved successfully`);
    }
  };

  const editProps = { editableProps, selectableProps, onClose: null, editing: new Animal(), show: false, onPost: handleToast };

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
      <AddEditViewer<Animal>
        editing={editObj}
        empty={new Animal()}
        childEditComponent={<EditModal onSave={handleSave} {...editProps} />}
      />
      <ImportExportViewer data={[...resolvedData.assigned, ...resolvedData.available]} />
      <Toast show={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
    </div>
  );
}
