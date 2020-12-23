import { eCollarType } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { SnackbarWrapper } from 'components/common';
import { INotificationMessage } from 'components/component_interfaces';
import Table from 'components/table/Table';
import { CollarStrings as S } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import EditCollar from 'pages/data/collars/EditCollar';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { assignedCollarProps, availableCollarProps, Collar } from 'types/collar';
import { formatAxiosError } from 'utils/common';

import AddEditViewer from '../common/AddEditViewer';

export default function CollarPage(): JSX.Element {
  const classes = useDataStyles();
  const [editObj, setEditObj] = useState<Collar>(new Collar());
  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);

  const handleSelect = (row: Collar): void => setEditObj(row);

  const [msg, setMsg] = useState<INotificationMessage>({ type: 'success', message: '' });

  const onSuccess = (data: Collar[]): void => 
    setMsg({ type: 'success', message: `collar ${data[0].device_id} saved` });
 
  const onError = (error: AxiosError): void => 
    setMsg({ type: 'error', message: `error saving collar: ${formatAxiosError(error)}` });
 
  // setup the mutation for saving collars
  const [mutate] = (useTelemetryApi().useMutateCollar as any)({ onSuccess, onError })

  const save = async (c: Collar): Promise<void> => await mutate([c]);

  const close = (): void => setMsg({ type: 'success', message: '' })

  const editProps = {
    editableProps: S.editableProps,
    editing: new Collar(),
    handleClose: null,
    iMsg: msg,
    open: false,
    onPost: null,
    onSave: save,
    selectableProps: S.selectableProps,
  };

  const exportProps = {
    iMsg: '',
    iTitle: '',
    eMsg: S.exportText,
    eTitle: S.exportTitle,
    handleToast: (msg: string): void => setMsg({message: msg, type: 'none'}),
  }

  const rowId = 'device_id';
  return (
    <SnackbarWrapper notif={msg}>
      <div className={classes.container}>
        <Table
          headers={assignedCollarProps}
          title={S.assignedCollarsTableTitle}
          queryProps={{ query: 'useCollarType', queryParam: eCollarType.Assigned, onNewData: (d: Collar[]): void => setCollarsA(d) }}
          onSelect={handleSelect}
          rowIdentifier={rowId}
        />
        <Table
          headers={availableCollarProps}
          title={S.availableCollarsTableTitle}
          queryProps={{ query: 'useCollarType', queryParam: eCollarType.Available, onNewData: (d: Collar[]): void => setCollarsU(d) }}
          onSelect={handleSelect}
          rowIdentifier={rowId}
        />

        <div className={classes.mainButtonRow}>
          <ImportExportViewer {...exportProps} data={[...collarsA, ...collarsU]} handleClose={close}/>

          <AddEditViewer<Collar> editing={editObj} empty={(): Collar => new Collar()} handleClose={close}>
            <EditCollar {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  )
}