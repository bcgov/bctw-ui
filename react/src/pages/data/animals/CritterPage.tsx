import Box from '@material-ui/core/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
// import ExportImportViewer, { IImportExportProps } from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
// import download from 'downloadjs';

export default function CritterPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as Animal);

  // for exporting state
  // const [critterA, setCrittersA] = useState<Animal[]>([]);
  // const [critterU, setCrittersU] = useState<Animal[]>([]);

  const handleSelectAttached = (row: AttachedAnimal): void => {
    setEditObj(row);
  };

  const handleSelectUnattached = (row: Animal): void => {
    setEditObj(row);
  }

  // set the export state when table loads
  // const onNewData = (d: Animal[]): void => (d.length && d[0].device_id ? setCrittersA(d) : setCrittersU(d));

  // pass this function to the import modal to allow user to download animal csv bulk import
  /*
  const handleDownloadTemplate = (): void => {
    download(Object.keys(new Animal()).join(), FileStrings.animalTemplateName, '');
  }
  */

  // props to be passed to the edit modal component
  // most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: new Animal(),
    open: false,
    onSave: (): void => { /* do nothing */ },
    handleClose: (): void => { /* do nothing */ },
  };

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Animals</h1>
        <Box display='flex' alignItems='center'>
          {/* <ExportImportViewer {...exportProps} /> */}
          <ModifyCritterWrapper editing={editObj}>
            <AddEditViewer<AttachedAnimal> editing={editObj as AttachedAnimal} empty={new AttachedAnimal()} addTooltip={CS.addTooltip}>
              <EditCritter {...editProps} />
            </AddEditViewer>
          </ModifyCritterWrapper>
        </Box>
      </Box>

      {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={AttachedAnimal.attachedCritterDisplayProps}
              title={CS.assignedTableTitle}
              queryProps={{ query: bctwApi.useAssignedCritters }}
              onSelect={handleSelectAttached}
            />
          </Box>
          <Box mb={4}>
            <DataTable
              headers={new Animal().displayProps}
              title={CS.unassignedTableTitle}
              queryProps={{ query: bctwApi.useUnassignedCritters }}
              onSelect={handleSelectUnattached}
            />
          </Box>
        </>
      </RowSelectedProvider>
    </ManageLayout>
  );
}
