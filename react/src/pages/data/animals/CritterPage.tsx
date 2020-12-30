import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import Table from 'components/table/Table';
import { SnackbarWrapper } from 'components/common';
import { CritterStrings as CS } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { Animal, assignedCritterProps, IAnimal, unassignedCritterProps } from 'types/animal';
import { formatAxiosError } from 'utils/common';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

export default function CritterPage(): JSX.Element {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [editObj, setEditObj] = useState<Animal>({} as Animal);

  const [critterA, setCrittersA] = useState<Animal[]>([]);
  const [critterU, setCrittersU] = useState<Animal[]>([]);

  // must be defined before mutation declaration
  const onSuccess = (data: IAnimal[]): void => 
    updateStatus({ type: 'success', message: `${data[0].animal_id ?? data[0].nickname ?? 'critter'} saved!`});
 
  const onError = (error: AxiosError): void => 
    updateStatus({ type: 'error', message: `error saving animal: ${formatAxiosError(error)}`});

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif)
  }

  // setup the post mutation
  const { mutateAsync } = (bctwApi.useMutateCritter as any)({onSuccess, onError});

  // critter properties that are displayed as select inputs
  const selectableProps = CS.editableProps.slice(3, 7);

  const handleSelect = (row: Animal): void => setEditObj(row);

  const save = async (a: Animal): Promise<Animal[]> => await mutateAsync(a);

  // props to be passed to the edit modal component
  const editProps = {
    editableProps: CS.editableProps,
    editing: new Animal(),
    open: false,
    onSave: save,
    selectableProps,
  };

  const ieProps = {
    eMsg: CS.exportText,
    eTitle: CS.exportTitle,
    iTitle: CS.importTitle,
    iMsg: CS.importText,
  }

  return (
    <SnackbarWrapper>
      <div className={classes.container}>
        <Table
          headers={assignedCritterProps}
          title={CS.assignedTableTitle}
          queryProps={{ query: 'useAssignedCritters', onNewData: (d: Animal[]): void => setCrittersA(d) }}
          onSelect={handleSelect}
        />
        <Table
          headers={unassignedCritterProps}
          title={CS.unassignedTableTitle}
          queryProps={{ query: 'useUnassignedCritters', onNewData: (d: Animal[]): void => setCrittersU(d) }}
          onSelect={handleSelect}
        />

        <div className={classes.mainButtonRow} >
          <ImportExportViewer {...ieProps} data={[...critterA, ...critterU]} />

          <AddEditViewer<Animal> editing={editObj} empty={(): Animal => new Animal()}>
            <EditCritter {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  )

}
