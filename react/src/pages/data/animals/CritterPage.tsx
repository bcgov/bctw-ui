import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { AlertBanner } from 'components/alerts/AlertBanner';
import { Icon } from 'components/common';
import { QuickSummary } from 'components/common/QuickSummary';
import dayjs from 'dayjs';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { AttachedCritter } from 'types/animal';
import { DataRetrievalDataTable } from '../collars/DataRetrievalDataTable';
import { CritterDataTables } from './CritterDataTables';
import DetailedAnimalView from './DetailedAnimalView';

export default function CritterPage(): JSX.Element {
  // const useAlert = useContext(AlertContext);
  const [showDataRetrieval, setShowDataRetrieval] = useState(false);
  const [detailAnimal, setDetailAnimal] = useState<AttachedCritter>(null);

  // const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);

  const inverseDataRetrieval = (): void => {
    setShowDataRetrieval((d) => !d);
  };
  // useEffect(() => {
  //   if (useAlert?.alerts?.length) {
  //     //Set only the valid (null valid_to) alerts where snoozed_to date < today
  //     const nonSnoozedValidAlerts = useAlert.alerts.filter(
  //       (a) => !a.valid_to.isValid() && !(dayjs(a.snoozed_to).diff(dayjs()) > 0)
  //     );
  //     setAlerts(nonSnoozedValidAlerts);
  //   }
  // }, [useAlert]);

  const dataTables = (): JSX.Element => (
    <Box>
      <QuickSummary handleDetails={inverseDataRetrieval} showDetails={showDataRetrieval} />
      <Box style={!showDataRetrieval ? {} : { display: 'none' }} mt={4}>
        <CritterDataTables detailViewAction={setDetailAnimal} />
      </Box>
      <Box style={showDataRetrieval ? {} : { display: 'none' }}>
        <DataRetrievalDataTable />
      </Box>
    </Box>
  );

  const detailedView = (): JSX.Element => {
    if (!detailAnimal) {
      return null;
    }

    detailAnimal.attachment_start = dayjs(detailAnimal.attachment_start);
    detailAnimal.attachment_end = dayjs(detailAnimal.attachment_end);

    return (
      <Box width='100%' sx={{ ml: -1 }}>
        <Button
          startIcon={<Icon icon='back' />}
          onClick={(): void => {
            setDetailAnimal(null);
          }}>
          Back to My Animals
        </Button>
        <DetailedAnimalView detailAnimal={detailAnimal} height={'500px'} />
      </Box>
    );
  };

  return (
    <ManageLayout>
      {/*
      //TODO critterbase integration this might be not needed 
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
        </Box> */}
      <AlertBanner />
      <Box display={detailAnimal === null ? 'none' : 'contents'}>{detailedView()}</Box>
      <Box display={detailAnimal !== null ? 'none' : 'contents'}>{dataTables()}</Box>
      {/*The above hack is in place so that the 
        data tables do not need to reload / re-query 
        anytime you wanna go back and forth between
        the detailed view and the data tables*/}
    </ManageLayout>
  );
}
