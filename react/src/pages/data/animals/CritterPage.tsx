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

export default function CritterPage(): JSX.Element {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Animal>({} as Animal);

  const [critterA, setCrittersA] = useState<Animal[]>([]);
  const [critterU, setCrittersU] = useState<Animal[]>([]);

  const [msg, setMsg] = useState<INotificationMessage>({ type: 'success', message: '' });

  // must be defined before mutation declaration
  const onSuccess = (data: IAnimal[]): void => 
    setMsg({ type: 'success', message: `${data[0].animal_id ?? data[0].nickname ?? 'critter'} saved!`})

  const onError = (error: AxiosError): void =>
    setMsg({ type: 'error', message: `error saving animal: ${formatAxiosError(error)}`})

  // setup the post mutation
  const [mutate] = (bctwApi.useMutateCritter as any)({ onSuccess, onError});

  // critter properties that are displayed as select inputs
  const selectableProps = CS.editableProps.slice(3, 7);

  // child components wants to show snackbar notification
  const handleToast = (msg: string): void => setMsg({type: 'none', message: msg});

  const close = (): void => setMsg({ type: 'success', message: '' })

  const handleSelect = (row: Animal): void => setEditObj(row);

  const save = async (a: Animal): Promise<void> => await mutate([a]);

  // props to be passed to the edit modal component
  const editProps = {
    editableProps: CS.editableProps,
    editing: new Animal(),
    handleClose: null, // use AddEditViewer close handler
    iMsg: msg,
    open: false,
    onPost: handleToast,
    onSave: save,
    selectableProps,
  };

  const ieProps = {
    eMsg: CS.exportText,
    eTitle: CS.exportTitle,
    handleToast,
    iTitle: CS.importTitle,
    iMsg: CS.importText,
    handleClose: () => { /* do nothing */}
  }

  return (
    <SnackbarWrapper notif={msg}>
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
          queryProps={{ query: 'useUnassignedCritters', onNewData: (d: Animal[]): void => setCrittersU(d) }} //setCrittersU(d) }}
          onSelect={handleSelect}
        />

        <div className={classes.mainButtonRow} >
          <ImportExportViewer {...ieProps} data={[...critterA, ...critterU]} />

          <AddEditViewer<Animal> editing={editObj} empty={(): Animal => new Animal()} handleClose={close}>
            <EditCritter {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  )

}
