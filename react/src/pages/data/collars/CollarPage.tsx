import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { CollarStrings as S } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCollar from 'pages/data/collars/EditCollar';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { AttachedCollar, Collar } from 'types/collar';
import AddEditViewer from '../common/AddEditViewer';
import CollarImport from 'pages/data/collars/CollarImport';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import { Button } from 'components/common';

export default function CollarPage(): JSX.Element {
  const api = useTelemetryApi();

  const [editObj, setEditObj] = useState<Collar | AttachedCollar>({} as Collar);
  const [showImport, setShowImport] = useState(false);
  const [deleted, setDeleted] = useState('');

  // set editing object when table row is selected
  const handleSelect = <T extends Collar>(row: T): void => setEditObj(row);

  const editProps = {
    editing: new Collar(),
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
  };

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Devices</h1>
        <Box display='flex' alignItems='center'>
          <ModifyCollarWrapper editing={editObj} onDelete={(collar_id: string): void => setDeleted(collar_id)}>
            <AddEditViewer<AttachedCollar>
              queryStatus='success'
              editing={editObj as AttachedCollar}
              empty={new AttachedCollar()}>
              <EditCollar {...editProps} />
            </AddEditViewer>
          </ModifyCollarWrapper>
          <ExportViewer<AttachedCollar>
            template={[
              'collar_id',
              'device_id',
              'frequency',
              'device_type',
              'device_make',
              'activation_status',
              'device_model',
              'wlh_id',
              'animal_id',
              'critter_id'
            ]}
            eTitle={S.exportTitle}
          />
          <Box ml={1}>
            <Button onClick={(): void => setShowImport((o) => !o)}>Import</Button>
          </Box>
        </Box>
      </Box>

      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={AttachedCollar.attachedDevicePropsToDisplay}
              title={S.assignedCollarsTableTitle}
              queryProps={{ query: api.useAttachedDevices }}
              onSelect={handleSelect}
              deleted={deleted}
            />
          </Box>
          <Box mb='3'>
            <DataTable
              headers={Collar.propsToDisplay}
              title={S.availableCollarsTableTitle}
              queryProps={{ query: api.useUnattachedDevices }}
              onSelect={handleSelect}
              deleted={deleted}
            />
          </Box>
        </>
      </RowSelectedProvider>
      <CollarImport open={showImport} handleClose={(): void => setShowImport(false)} />
    </ManageLayout>
  );
}
