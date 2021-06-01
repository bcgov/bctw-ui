import Table from 'components/table/Table';
import { CritterStrings as CS, FileStrings } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { Animal, assignedCritterProps, unassignedCritterProps } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import download from 'downloadjs';

export default function CritterPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Animal>({} as Animal);

  // for exporting state
  const [critterA, setCrittersA] = useState<Animal[]>([]);
  const [critterU, setCrittersU] = useState<Animal[]>([]);

  const handleSelect = (row: Animal): void => {
    // console.log(`critter_id: ${row.critter_id} p: ${row.permission_type}`);
    setEditObj(row);
  };

  // set the export state when table loads
  const onNewData = (d: Animal[]): void => (d.length && d[0].device_id ? setCrittersA(d) : setCrittersU(d));

  // pass this function to the import modal to allow user to download animal csv bulk import
  const handleDownloadTemplate = (): void => {
    download(Object.keys(new Animal()).join(), FileStrings.animalTemplateName, '');
  }

  // props to be passed to the edit modal component
  const editProps = {
    editing: new Animal(),
    open: false, // overwritten in {AddEditViewer}
    onSave: null, // save handler is overwritten in {ModifyCritterWrappper}
    handleClose: null,
  };

  const exportProps = {
    eMsg: CS.exportText,
    eTitle: CS.exportTitle,
    downloadTemplate: handleDownloadTemplate,
  };

  return (
    <ManageLayout>
      <div className='container'>
        <RowSelectedProvider>
          <>
            <Table
              headers={assignedCritterProps}
              title={CS.assignedTableTitle}
              queryProps={{ query: bctwApi.useAssignedCritters, onNewData }}
              onSelect={handleSelect}
            />
            <Table
              headers={unassignedCritterProps}
              title={CS.unassignedTableTitle}
              queryProps={{ query: bctwApi.useUnassignedCritters, onNewData }}
              onSelect={handleSelect}
            />
          </>
        </RowSelectedProvider>
        <div className='button-row'>
          <ExportImportViewer {...exportProps} data={[...critterA, ...critterU]} />
          <ModifyCritterWrapper editing={editObj}>
            <AddEditViewer<Animal> editing={editObj} empty={new Animal()}>
              <EditCritter {...editProps} />
            </AddEditViewer>
          </ModifyCritterWrapper>
        </div>
      </div>
    </ManageLayout>
  );
}
