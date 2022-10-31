import { Button, Container } from '@mui/material';
import Box from '@mui/material/Box';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { CritterStrings } from 'constants/strings';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useContext, useState } from 'react';
import { UserAnimalAccess } from './UserAnimalAccess';

import { NotificationBanner } from 'components/common/Banner';
import { NotificationsMenu } from 'components/common/partials/NotificationsMenu';
import { QuickSummary } from 'components/common/QuickSummary';
import { DataRetrievalDataTable } from '../collars/DataRetrievalDataTable';
import { CritterDataTables } from './CritterDataTables';
import { AlertContext } from 'contexts/UserAlertContext';
import { FormatAlert } from 'components/common/partials/FormatAlert';
export default function CritterPage(): JSX.Element {
  const useAlert = useContext(AlertContext);
  const [showDataRetrieval, setShowDataRetrieval] = useState(false);
  const [openManageAnimals, setOpenManageAnimals] = useState(false);
  const inverseManageModal = (): void => {
    setOpenManageAnimals((a) => !a);
  };
  const inverseDataRetrieval = (): void => {
    setShowDataRetrieval((d) => !d);
  };
  return (
    <ManageLayout>
      <SpeciesProvider>
        <Box className='manage-layout-titlebar'>
          <h1>{CritterStrings.title}</h1>
          <Box display='flex' alignItems='center'>
            {/* Might be adding this back */}
            {/* <NotificationsMenu /> */}
            <Button size='medium' variant='outlined' onClick={inverseManageModal}>
              {CritterStrings.manageMyAnimals}
            </Button>
            <FullScreenDialog open={openManageAnimals} handleClose={inverseManageModal}>
              <Container maxWidth='xl'>
                <h1>{CritterStrings.manageMyAnimals}</h1>
                <UserAnimalAccess />
              </Container>
            </FullScreenDialog>
          </Box>
        </Box>
        <NotificationBanner
          hiddenContent={useAlert?.alerts?.map((alert) => (
            <FormatAlert format='banner' {...alert} />
          ))}
        />
        <QuickSummary handleDetails={inverseDataRetrieval} showDetails={showDataRetrieval} />
        <Box style={!showDataRetrieval ? {} : { display: 'none' }} mt={4}>
          <CritterDataTables />
        </Box>
        <Box style={showDataRetrieval ? {} : { display: 'none' }}>
          <DataRetrievalDataTable />
        </Box>
      </SpeciesProvider>
    </ManageLayout>
  );
}
