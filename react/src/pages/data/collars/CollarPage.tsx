import { eCollarType, IBulkUploadResults } from 'api/api_interfaces';
import { SnackbarWrapper } from 'components/common';
import { INotificationMessage } from 'components/component_interfaces';
import Table from 'components/table/Table';
import { CollarStrings as S } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ImportExportViewer from 'pages/data/bulk/ExportImportViewer';
import EditCollar from 'pages/data/collars/EditCollar';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { assignedCollarProps, availableCollarProps, Collar } from 'types/collar';
import AddEditViewer from '../common/AddEditViewer';
import { useQueryClient } from 'react-query';

export default function CollarPage(): JSX.Element {
  const classes = useDataStyles();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const [editObj, setEditObj] = useState<Collar>(new Collar());

  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => setEditObj(row);

  // handlers for save mutation response
  const onSuccess = (data: IBulkUploadResults<Collar>): void => {
    if (data.errors.length) {
      updateStatus({ type: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const collar = data.results[0];
    updateStatus({ type: 'success', message: `collar ${collar.device_id} saved` });
    let availableQueryKey;
    let isCollarMatch = false;
    queryClient.invalidateQueries({
      predicate: (query) => {
        // save this query key if a new collar was added
        if (query.queryKey[2] === 'Available') {
          availableQueryKey = query.queryKey;
        }
        const staleData = query.state.data as Collar[];
        const found = staleData.find((c) => c.device_id === collar.device_id);
        if (found) {
          isCollarMatch = true;
          return true;
        }
        return false;
      }
    });
    if (!isCollarMatch && availableQueryKey) {
      queryClient.invalidateQueries(availableQueryKey);
    }
  };

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif); // update api response context
  };

  // setup the mutation for saving collars
  const { mutateAsync } = (useTelemetryApi().useMutateCollar as any)({ onSuccess });

  const save = async (c: Collar): Promise<void> => await mutateAsync(c);

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

  const rowId = 'collar_id';
  return (
    <SnackbarWrapper>
      <div className={classes.container}>
        <Table
          headers={assignedCollarProps}
          title={S.assignedCollarsTableTitle}
          queryProps={{
            query: 'useCollarType',
            queryParam: eCollarType.Assigned,
            onNewData: (d: Collar[]): void => setCollarsA(d)
          }}
          onSelect={handleSelect}
          rowIdentifier={rowId}
        />
        <Table
          headers={availableCollarProps}
          title={S.availableCollarsTableTitle}
          queryProps={{
            query: 'useCollarType',
            queryParam: eCollarType.Available,
            onNewData: (d: Collar[]): void => setCollarsU(d)
          }}
          onSelect={handleSelect}
          rowIdentifier={rowId}
        />

        <div className={classes.mainButtonRow}>
          <ImportExportViewer {...exportProps} data={[...collarsA, ...collarsU]} />

          <AddEditViewer<Collar> editing={editObj} empty={(): Collar => new Collar()}>
            <EditCollar {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  );
}
