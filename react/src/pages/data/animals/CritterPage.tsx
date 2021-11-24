import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CritterStrings, CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import { QueryStatus } from 'react-query';
import { doNothing, doNothingAsync } from 'utils/common_helpers';

export default function CritterPage(): JSX.Element {
  const api = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as Animal);
  const [deleted, setDeleted] = useState('');

  const handleSelect = <T extends Animal>(row: T): void => setEditObj(row);

  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
  };

  const addEditProps = {
    editing: new AttachedAnimal(),
    empty: new AttachedAnimal(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus
  };

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Animals</h1>
        <Box display='flex' alignItems='center'>
          <ModifyCritterWrapper editing={editObj} onDelete={(critter_id: string): void => setDeleted(critter_id)}>
            <AddEditViewer<AttachedAnimal> {...addEditProps}>
              <EditCritter {...editProps} />
            </AddEditViewer>
          </ModifyCritterWrapper>
          <ExportViewer<AttachedAnimal>
            template={[
              'critter_id',
              'species',
              'population_unit',
              'wlh_id',
              'animal_id',
              'collar_id',
              'device_id',
              'frequency',
              'animal_id'
            ]}
            eTitle={CritterStrings.exportTitle}
          />
        </Box>
      </Box>

      {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={AttachedAnimal.attachedCritterDisplayProps}
              title={CS.assignedTableTitle}
              queryProps={{ query: api.useAssignedCritters }}
              onSelect={handleSelect}
              deleted={deleted}
            />
          </Box>
          <Box mb={4}>
            <DataTable
              headers={new Animal().displayProps}
              title={CS.unassignedTableTitle}
              queryProps={{ query: api.useUnassignedCritters }}
              onSelect={handleSelect}
              deleted={deleted}
            />
          </Box>
        </>
      </RowSelectedProvider>
    </ManageLayout>
  );
}
