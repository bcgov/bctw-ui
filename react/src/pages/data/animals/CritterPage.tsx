import { AxiosError } from 'axios';
import { Toast } from 'components/common';
import { INotificationMessage } from 'components/component_interfaces';
import Table from 'components/table/Table';
import { CritterStrings as CS } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { Animal, assignedCritterProps, IAnimal, unassignedCritterProps } from 'types/animal';
import { formatAxiosError } from 'utils/common';

export default function CritterPage() {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Animal>({} as Animal);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const [critterA, setCrittersA] = useState<Animal[]>([]);
  const [critterU, setCrittersU] = useState<Animal[]>([]);

  const [msg, setMsg] = useState<INotificationMessage>({type: 'success', message: ''});

  // must be defined before mutation declaration
  const handlePost = (data?: IAnimal[], error?: AxiosError) => {
    let tempMsg: INotificationMessage = {type: 'success', message: ''};
    if (data && data.length) {
      tempMsg.message = `${data[0].animal_id ?? data[0].nickname ?? 'critter'} saved!`;
    } else {
      tempMsg.type = 'error';
      tempMsg.message = `error saving animal: ${formatAxiosError(error)}`;
    }
    setMsg(tempMsg)
    handleToast(tempMsg.message);
  }

  // setup the post mutation
  const [mutate] = bctwApi.useMutateCritter({
    onSuccess: (data) => handlePost(data),
    onError: (err) => handlePost(null, err)
  });

  // critter properties that are displayed as select inputs
  const selectableProps = CS.editableProps.slice(3, 7);

  // child components wants to show snackbar notification
  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const close = () => setMsg({type: 'success', message: ''})

  const handleSelect = (row: Animal) => setEditObj(row);

  const save = async (a: Animal) => await mutate([a]);

  // props to be passed to the edit modal component
  const editProps = { editableProps: CS.editableProps, selectableProps, onClose: null, editing: new Animal(), show: false, onPost: handleToast };
  const ieProps = { iTitle: CS.importTitle, iMsg: CS.importText, eTitle: CS.exportTitle, eMsg: CS.exportText, handleToast }

  return (
    <>
      <div className={classes.container}>
        <Table
          headers={assignedCritterProps}
          title={CS.assignedTableTitle}
          queryProps={{ query: 'useAssignedCritters', onNewData: (d: Animal[]) => setCrittersA(d)}}
          onSelect={handleSelect}
        />
        <Table
          headers={unassignedCritterProps}
          title={CS.unassignedTableTitle}
          queryProps={{ query: 'useUnassignedCritters', onNewData: (d: Animal[]) => setCrittersU(d)}} //setCrittersU(d) }}
          onSelect={handleSelect}
        />

        <div className={classes.mainButtonRow} >
          <ImportExportViewer {...ieProps} data={[...critterA, ...critterU]} />

          <AddEditViewer<Animal> editing={editObj} empty={() => new Animal()} onClose={close}>
            <EditCritter onSave={save} {...editProps} iMsg={msg} />
          </AddEditViewer>
        </div>

        <Toast show={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
      </div>


    </>
  )

}
