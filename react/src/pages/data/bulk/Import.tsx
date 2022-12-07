import { Box } from '@mui/material';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';
import { PageTabs } from 'components/common/partials/PageTabs';
import { AnimalAndDeviceImportTab } from './ImportTabs';
import { TelemetryImportTab } from './ImportTabs';
import { KeyXImportTab } from './ImportTabs';
import ManageLayout from 'pages/layouts/ManageLayout';

// const SIZE_LIMIT = 31457280;

// const useStyles = makeStyles((theme) => ({
//   spacing: {
//     marginTop: theme.spacing(2)
//   },
//   spacingTopBottom: {
//     marginTop: theme.spacing(2),
//     marginBottom: theme.spacing(2)
//   },
//   paper: {
//     marginTop: theme.spacing(2),
//     padding: '16px',
//     backgroundColor: 'text.secondary',
//     display: 'flex',
//     justifyContent: 'center'
//   }
// }));

// interface RowColPair {
//   row?: number;
//   col?: string;
// }

// type ImportTab = 'Animal and Device' | 'Telemetry' | 'Vectronic KeyX';
// enum TabNames {
//   metadata,
//   telemetry
// }

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {
  return (
    <ManageLayout>
      <div className='container'>
        <h1>Data Import</h1>
        <Box mt={2}>
          {/* Missing telemetry tab until more information about new table */}
          <PageTabs keepMounted tabLabels={['Animal and Device', 'Vectronic KeyX']}>
            <AnimalAndDeviceImportTab />
            {/* <TelemetryImportTab /> */}
            <KeyXImportTab />
          </PageTabs>
        </Box>
      </div>
    </ManageLayout>
  );
}
