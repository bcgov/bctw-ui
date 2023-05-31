import { Box } from '@mui/material';
import { PageTabs } from 'components/common/partials/PageTabs';
import ManageLayout from 'pages/layouts/ManageLayout';
import { AnimalAndDeviceImportTab, KeyXImportTab } from './ImportTabs';

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {
  return (
    <ManageLayout>
      <h1>Data Import</h1>
      <Box mt={2}>
        {/* Missing telemetry tab until more information about new table */}
        <PageTabs keepMounted tabLabels={['Critter and Device', 'Vectronic KeyX']}>
          <AnimalAndDeviceImportTab />
          {/* <TelemetryImportTab /> */}
          <KeyXImportTab />
        </PageTabs>
      </Box>
    </ManageLayout>
  );
}
