import { Button, Container } from '@mui/material';
import Box from '@mui/material/Box';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import DataTable from 'components/table/DataTable';
import { CritterStrings } from 'constants/strings';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { AttachedCollar } from 'types/collar';
import { UserAnimalAccess } from './UserAnimalAccess';

import { NotificationBanner } from 'components/common/Banner';
import { QuickSummary } from 'components/common/QuickSummary';
import { CritterDataTables } from './CritterDataTables';
export default function CritterPage(): JSX.Element {
  const api = useTelemetryApi();

  const [showDataRetrieval, setShowDataRetrieval] = useState(true);
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
        <NotificationBanner hiddenContent={[]} />
        <Box mb={4}>
          <QuickSummary handleDetails={inverseDataRetrieval} />
        </Box>
        <Box style={showDataRetrieval ? {} : { display: 'none' }}>
          <DataTable
            headers={AttachedCollar.dataRetrievalPropsToDisplay}
            title={'Data Retrieval'}
            queryProps={{ query: api.useAttachedDevices }}
          />
        </Box>
        <Box style={!showDataRetrieval ? {} : { display: 'none' }}>
          <CritterDataTables />
        </Box>
      </SpeciesProvider>
    </ManageLayout>
  );
}
