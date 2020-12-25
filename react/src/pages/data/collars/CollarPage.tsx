import { eCollarType } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { SnackbarWrapper } from 'components/common';
import { ConfirmModalProps, INotificationMessage } from 'components/component_interfaces';
import ConfirmModal  from 'components/modal/ConfirmModal';
import Table from 'components/table/Table';
import { CollarStrings as S } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import EditCollar from 'pages/data/collars/EditCollar';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useEffect, useState } from 'react';
import { assignedCollarProps, availableCollarProps, Collar, collarPropsToPreserve, NewCollarType, newCollarTypeToSelectableCode } from 'types/collar';
import { formatAxiosError } from 'utils/common';
import AddEditViewer from '../common/AddEditViewer';

export default function CollarPage(): JSX.Element {
  const classes = useDataStyles();
  const responseDispatch = useResponseDispatch();

  const [editObj, setEditObj] = useState<Collar>(new Collar());

  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<NewCollarType>(NewCollarType.Other);

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => setEditObj(row);

  // handlers for save mutation response
  const onSuccess = (data: Collar[]): void =>
    updateStatus({ type: 'success', message: `collar ${data[0].device_id} saved` });

  const onError = (error: AxiosError): void =>
    updateStatus({ type: 'error', message: `error saving collar: ${formatAxiosError(error)}` });

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif); // update api response context
  }

  // setup the mutation for saving collars
  const [mutate] = (useTelemetryApi().useMutateCollar as any)({ onSuccess, onError })

  const save = async (c: Collar): Promise<void> => await mutate([c]);

  const editProps = {
    editableProps: S.editableProps,
    editing: editObj,
    open: false,
    onSave: save,
    selectableProps: S.selectableProps,
    collarType,
  };

  const exportProps = {
    iMsg: '',
    iTitle: '',
    eMsg: S.exportText,
    eTitle: S.exportTitle,
  }

  const confirmProps: ConfirmModalProps = {
    message: S.addCollarTypeText,
    title: S.addCollarTypeTitle,
    btnYesText: 'VHF',
    btnNoText: 'Vectronics',
    open: false,
    handleClose: (): void => handleAddClick(NewCollarType.Vect),
    handleClickYes: (): void => handleAddClick(NewCollarType.VHF)
  }

  // fixme: not working. since usestate for editobject is async,
  // and useeffect on editing doesnt seem to be updating in time for the modal to appear.
  // so it takes several open / closes of it before the select components are updated 
  const handleAddClick = (type: NewCollarType): void => {
    setCollarType(type);
    setEditObj({...(new Collar()), ...newCollarTypeToSelectableCode(collarType)} as Collar)
  }

  useEffect(() => { /* do nothing */ }, [editObj]);

  const rowId = 'device_id';
  return (
    <SnackbarWrapper>
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
          <ImportExportViewer {...exportProps} data={[...collarsA, ...collarsU]} iDisabled={true} />

          <AddEditViewer<Collar> editing={editObj} empty={(): Collar => new Collar()} propsToPreserve={collarPropsToPreserve} customAdd={<ConfirmModal {...confirmProps}  />}>
            <EditCollar {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  )
}