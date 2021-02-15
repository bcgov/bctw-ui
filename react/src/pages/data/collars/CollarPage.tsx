import { IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import Table from 'components/table/Table';
import { CollarStrings as S } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import EditCollar from 'pages/data/collars/EditCollar';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { assignedCollarProps, availableCollarProps, Collar, eCollarAssignedStatus } from 'types/collar';
import AddEditViewer from '../common/AddEditViewer';
import { useQueryClient } from 'react-query'; // to invalidate queries

export default function CollarPage(): JSX.Element {
  const classes = useDataStyles();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Collar>(new Collar());

  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => setEditObj(row);

  // handlers for save mutation response
  const onSuccess = (data: IBulkUploadResults<Collar>): void => {
    if (data.errors.length) {
      responseDispatch({ type: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const collar = data.results[0];
    responseDispatch({ type: 'success', message: `collar ${collar.device_id} saved` });
    queryClient.invalidateQueries('collartype');
  };

  // setup the mutation for saving collars
  const { mutateAsync } = (bctwApi.useMutateCollar as any)({ onSuccess });

  const save = async (c: IUpsertPayload<Collar>): Promise<void> => await mutateAsync(c);

  const editProps = {
    editableProps: S.editableProps,
    editing: editObj,
    open: false,
    onSave: save,
    selectableProps: S.selectableProps
  };

  const exportProps = {
    iMsg: '',
    iTitle: '',
    eMsg: S.exportText,
    eTitle: S.exportTitle
  };

  return (
    <div className={classes.container}>
      <Table
        headers={assignedCollarProps}
        title={S.assignedCollarsTableTitle}
        queryProps={{
          query: bctwApi.useCollarType,
          param: eCollarAssignedStatus.Assigned,
          onNewData: (d: Collar[]): void => setCollarsA(d)
        }}
        onSelect={handleSelect}
      />
      <Table
        headers={availableCollarProps}
        title={S.availableCollarsTableTitle}
        queryProps={{
          query: bctwApi.useCollarType,
          param: eCollarAssignedStatus.Available,
          onNewData: (d: Collar[]): void => setCollarsU(d)
        }}
        onSelect={handleSelect}
      />

      <div className={classes.mainButtonRow}>
        <ExportImportViewer {...exportProps} data={[...collarsA, ...collarsU]} />

        <AddEditViewer<Collar> editing={editObj} empty={(): Collar => new Collar()}>
          <EditCollar {...editProps} />
        </AddEditViewer>
      </div>
    </div>
  );
}
