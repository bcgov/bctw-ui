import Box from '@mui/material/Box';
import Button from 'components/form/Button';
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
import ExportImportViewer from '../bulk/ExportImportViewer';
import { classToPlain } from 'class-transformer';

export default function CollarPage(): JSX.Element {
  const api = useTelemetryApi();

  const [editObj, setEditObj] = useState<Collar | AttachedCollar>({} as Collar);
  const [showImport, setShowImport] = useState(false);

  const [devicesA, setDevicesA] = useState([]);
  const [devicesU, setDevicesU] = useState([]);

  // set editing object when table row is selected
  const handleSelect = <T extends Collar,>(row: T): void => setEditObj(row);

  const editProps = {
    editing: new Collar(),
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing,
  };

  const onNewData = (collars: AttachedCollar[] | Collar[]): void => {
    const asPlain = collars.map(device => classToPlain(device));
    if (collars[0] instanceof AttachedCollar) {
      setDevicesA(asPlain);
    } else {
      setDevicesU(asPlain);
    }
  }

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Devices</h1>
        <Box display='flex' alignItems='center'>
          <ModifyCollarWrapper editing={editObj}>
            <AddEditViewer<AttachedCollar> queryStatus='success' editing={editObj as AttachedCollar} empty={new AttachedCollar()}>
              <EditCollar {...editProps} />
            </AddEditViewer>
          </ModifyCollarWrapper>
          <ExportImportViewer data={[...devicesA, ...devicesU]} />
          <Box ml={1}>
            <Button size='large' onClick={(): void => setShowImport((o) => !o)}>
              Import
            </Button>
          </Box>
        </Box>
      </Box>

      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={AttachedCollar.attachedDevicePropsToDisplay}
              title={S.assignedCollarsTableTitle}
              queryProps={{query: api.useAttachedDevices, onNewData: (v: AttachedCollar[]): void => onNewData(v)}}
              onSelect={handleSelect}
            />
          </Box>
          <Box mb='3'>
            <DataTable
              headers={Collar.propsToDisplay}
              title={S.availableCollarsTableTitle}
              queryProps={{query: api.useUnattachedDevices, onNewData}}
              onSelect={handleSelect}
            />
          </Box>
        </>
      </RowSelectedProvider>
      <CollarImport open={showImport} handleClose={(): void => setShowImport(false)} />
    </ManageLayout>
  );
}
