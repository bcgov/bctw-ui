import Button from 'components/form/Button';
import Table from 'components/table/Table';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { CollarStrings as S } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCollar from 'pages/data/collars/EditCollar';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { collarPropsToDisplay, Collar, eCollarAssignedStatus, attachedCollarProps } from 'types/collar';
import AddEditViewer from '../common/AddEditViewer';
import CollarImport from 'pages/data/collars/CollarImport';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';

export default function CollarPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Collar>(new Collar());
  const [collarsA, setCollarsA] = useState<Collar[]>([]);
  const [collarsU, setCollarsU] = useState<Collar[]>([]);
  const [showImport, setShowImport] = useState<boolean>(false);

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => {
    setEditObj(row);
  };

  // pass as callback to table component to set export data when api returns collar data
  const onNewData = (d: Collar[]): void => {
    if (d.length && d[0].animal_id) {
      setCollarsA(d);
    } else {
      setCollarsU(d);
    }
  };

  const editProps = {
    editing: editObj,
    open: false,
    onSave: null
  };

  const tableProps: ITableQueryProps<Collar> = {
    query: bctwApi.useCollarType,
    onNewData
  };
  
  return (
    <ManageLayout>
      <div className='container'>
        <RowSelectedProvider>
          <>
            <Table
              headers={attachedCollarProps}
              title={S.assignedCollarsTableTitle}
              queryProps={{ ...tableProps, param: eCollarAssignedStatus.Assigned }}
              onSelect={handleSelect}
            />
            <Table
              headers={collarPropsToDisplay}
              title={S.availableCollarsTableTitle}
              queryProps={{ ...tableProps, param: eCollarAssignedStatus.Available }}
              onSelect={handleSelect}
            />
          </>
        </RowSelectedProvider>
        <CollarImport open={showImport} handleClose={(): void => setShowImport(false)} />
        <div className='button-row'>
          {/* <ExportImportViewer {...exportProps} data={[...collarsA, ...collarsU]} /> */}
          {/* <ConfirmModal {...confirmProps} /> */}
          <Button onClick={(): void => setShowImport(o => !o)}>Import</Button>
          <ModifyCollarWrapper editing={editObj}>
            <AddEditViewer<Collar> editing={editObj} empty={new Collar()}>
              <EditCollar {...editProps} />
            </AddEditViewer>
          </ModifyCollarWrapper>
        </div>
        <p>collar ID: {editObj.collar_id}</p>
      </div>
    </ManageLayout>
  );
}
