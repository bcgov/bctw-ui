import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { PageProp } from 'components/component_interfaces';
import ConfirmModal from 'components/modal/ConfirmModal';
import Table from 'components/table/Table';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { CollarStrings as S } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import EditCollar from 'pages/data/collars/EditCollar';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { assignedCollarProps, availableCollarProps, Collar, eCollarAssignedStatus } from 'types/collar';
import { formatAxiosError } from 'utils/common';
import AddEditViewer from '../common/AddEditViewer';

export default function CollarPage(props: PageProp): JSX.Element {
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();
  const bctwApi = useTelemetryApi();

  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [editObj, setEditObj] = useState<Collar>(new Collar());
  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);

  // handlers for mutation response
  const onSuccess = (data: IBulkUploadResults<Collar>): void => {
    if (data.errors.length) {
      responseDispatch({ type: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const collar = data.results[0];
    responseDispatch({ type: 'success', message: `collar ${collar.device_id} saved` });
    queryClient.invalidateQueries('collartype');
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  const onDelete = async (): Promise<void> => {
    responseDispatch({ type: 'success', message: `collar deleted successfully` });
    queryClient.invalidateQueries('collartype');
  };

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => {
    setEditObj(row);
    props.setSidebarContent(<p>collar id: {row.collar_id}</p>);
  };
  const handleShowDeleteModal = (): void => {
    setShowConfirmDelete((o) => !o);
  };

  // pass as callback to table component to set export data when api returns collar data
  const onNewData = (d: Collar[]): void => {
    if (d.length && d[0].animal_id) {
      setCollarsA(d)
    } else {
      setCollarsU(d);
    }
  }

  // setup the mutation collar mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCollar({ onSuccess });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDelete, onError });

  const saveCollar = async (c: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => await saveMutation(c);
  const deleteCollar = async (): Promise<void> => {
    const payload: IDeleteType = {
      id: editObj.collar_id,
      objType: 'collar'
    };
    await deleteMutation(payload);
  };

  const createDeleteMessage = (): string => {
    const base = editObj.animal_id
      ? `CAREFUL! An animal with ID ${editObj.animal_id} is attached to this collar. `
      : '';
    return `${base}Deleting this collar will prevent other users from accessing it. Are you sure you want to delete it?`;
  };

  const editProps = {
    editableProps: S.editableProps,
    editing: editObj,
    open: false,
    onSave: saveCollar,
    selectableProps: S.selectableProps
  };

  const exportProps = {
    iMsg: '',
    iTitle: '',
    eMsg: S.exportText,
    eTitle: S.exportTitle
  };

  const tableProps: ITableQueryProps<Collar> = {
    query: bctwApi.useCollarType,
    defaultSort: { property: 'device_id', order: 'desc' },
    onNewData
  }

  return (
    <div className='container'>
      <ConfirmModal
        handleClickYes={deleteCollar}
        handleClose={(): void => setShowConfirmDelete(false)}
        open={showConfirmDelete}
        message={createDeleteMessage()}
        title={`Deleting ${editObj.device_make} collar ${editObj.device_id}`}
      />
      <RowSelectedProvider>
        <>
          <Table
            headers={assignedCollarProps}
            title={S.assignedCollarsTableTitle}
            queryProps={{...tableProps, param: eCollarAssignedStatus.Assigned}}
            onSelect={handleSelect}
          />
          <Table
            headers={availableCollarProps}
            title={S.availableCollarsTableTitle}
            queryProps={{...tableProps, param: eCollarAssignedStatus.Available}}
            onSelect={handleSelect}
          />
        </>
      </RowSelectedProvider>
      <div className='button-row'>
        <ExportImportViewer {...exportProps} data={[...collarsA, ...collarsU]} />
        <AddEditViewer<Collar> editing={editObj} empty={new Collar()} onDelete={handleShowDeleteModal}>
          <EditCollar {...editProps} />
        </AddEditViewer>
      </div>
    </div>
  );
}
