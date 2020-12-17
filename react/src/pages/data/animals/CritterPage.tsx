import { AxiosError } from 'axios';
import { ErrorMessage, Toast } from 'components/common';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { useDataStyles } from 'pages/data/common/data_styles';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Animal, assignedCritterProps, unassignedCritterProps } from 'types/animal';
import { CritterStrings as CS } from 'constants/strings';

export default function CritterPage() {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();

  const { isFetching, isLoading, isError, error, resolvedData /*latestData*/ } = bctwApi.useCritters(0);

  const [mutate] = useMutation<Animal[], AxiosError>(bctwApi.upsertCritter);

  const [editObj, setEditObj] = useState<Animal>({} as Animal);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const selectableProps = CS.editableProps.slice(3, 7);

  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const handleSelect = (row: Animal) => {
    setEditObj(row);
  };

  const createNewAnimal = () => new Animal();

  const handleSave = async (o: any) => {
    const result: Animal[] = await mutate(o);
    if (Array.isArray(result)) {
      const critter = result[0];
      handleToast(`${critter?.animal_id ?? critter?.nickname ?? 'critter'} saved successfully`);
    }
  };

  // props to be passed to the edit modal component
  const editProps = { editableProps: CS.editableProps, selectableProps, onClose: null, editing: new Animal(), show: false, onPost: handleToast };
  const ieProps = { iTitle: CS.importTitle, iMsg: CS.importText, eTitle: CS.exportTitle, eMsg: CS.exportText, handleToast }

  return (
    <>
      {
        isLoading || isFetching ?
          (<div>loading...</div>) :
          isError ?
            (<ErrorMessage message={`error ${error?.response?.data ?? error.message}`} />) :
            (
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
                  empty={createNewAnimal}>
                  <EditCritter onSave={handleSave} {...editProps} />
                </AddEditViewer>
                <ImportExportViewer {...ieProps} data={[[...resolvedData.assigned, ...resolvedData.available]]} />
                <Toast show={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
              </div>
            )

      }
    </>
  )

}
