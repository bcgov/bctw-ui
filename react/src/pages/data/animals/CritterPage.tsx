import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import { QueryStatus } from 'react-query';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import { classToPlain } from 'class-transformer';

export default function CritterPage(): JSX.Element {
  const api = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as Animal);

  // for exporting state
  const [critterA, setCrittersA] = useState([]);
  const [critterU, setCrittersU] = useState([]);

  const handleSelect = <T extends Animal>(row: T): void => setEditObj(row);

  const onNewData = (animals: AttachedAnimal[] | Animal[]): void => {
    const asPlain = animals.map(a => classToPlain(a));
    if (animals[0] instanceof AttachedAnimal) {
      setCrittersA(asPlain);
    } else {
      setCrittersU(asPlain);
    }
  }

  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing,
  };

  const addEditProps = {
    editing: new AttachedAnimal(),
    empty: new AttachedAnimal(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus
  }

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Animals</h1>
        <Box display='flex' alignItems='center'>
          <ModifyCritterWrapper editing={editObj}>
            <AddEditViewer<AttachedAnimal> {...addEditProps} >
              <EditCritter {...editProps} />
            </AddEditViewer>
          </ModifyCritterWrapper>
          <ExportImportViewer data={[...critterA, ...critterU]} />
        </Box>
      </Box>

      {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={AttachedAnimal.attachedCritterDisplayProps}
              title={CS.assignedTableTitle}
              queryProps={{ query: api.useAssignedCritters, onNewData: (a: AttachedAnimal[]): void => onNewData(a)}}
              onSelect={handleSelect}
            />
          </Box>
          <Box mb={4}>
            <DataTable
              headers={new Animal().displayProps}
              title={CS.unassignedTableTitle}
              queryProps={{ query: api.useUnassignedCritters, onNewData}}
              onSelect={handleSelect}
            />
          </Box>
        </>
      </RowSelectedProvider>
    </ManageLayout>
  );
}
