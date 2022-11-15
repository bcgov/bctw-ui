import { Box, Button, ButtonBase, Card, CardContent, Grid, Link, List, ListItem, Typography } from '@mui/material';
import { InfoBanner } from 'components/alerts/Banner';
import { SubHeader } from 'components/common/partials/SubHeader';
import { BannerStrings } from 'constants/strings';
import { useState } from 'react';
import { Collar } from 'types/collar';
import ManageLayout from './layouts/ManageLayout';
// Place component constants / objects here

const TEST = 'Testing';
const DEVICE_IDS = [84789, 12345, 98765, 223344];

/**
 * Testing area for UI comoponents.
 * /playground route.
 */
export const DevPlayground = (): JSX.Element => {
  const [background, setBackground] = useState(false);
  return (
    <ManageLayout>
      <h1>Dev Playground</h1>
      <Box pb={2} display='flex' justifyContent='space-between'>
        <SubHeader text={'Component Development and Testing Area'} />
        <Button variant='contained' onClick={() => setBackground((b) => !b)}>
          {`White Background - ${background}`}
        </Button>
      </Box>
      <Box height={'80%'} sx={{ backgroundColor: background ? '#ffff' : 'transparent' }}>
        {/* Place components below here */}
        <TempComponent deviceIds={DEVICE_IDS} />
      </Box>
    </ManageLayout>
  );
};

interface KeyXCardProps {
  deviceIds: number[];
}

// Temporarily build components down here for development
const TempComponent = ({ deviceIds }: KeyXCardProps): JSX.Element => {
  return (
    <>
      <Card sx={{ width: '24rem' }}>
        <CardContent sx={{ paddingBottom: 0 }}>
          <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        </CardContent>
        <Box px={5} pb={2}>
          <List>
            {deviceIds.map((id, i) => (
              <ListItem key={`deviceid-${i}`}>
                <Box display='flex' flexDirection='row' alignItems='center' justifyContent='space-between' width='100%'>
                  <Box>
                    {i == 0 && (
                      <Typography pb={2} fontWeight='bold'>
                        Device ID
                      </Typography>
                    )}
                    {id}
                  </Box>
                  <Box>
                    {i == 0 && (
                      <Typography pb={2} fontWeight='bold'>
                        KeyX File
                      </Typography>
                    )}
                    <Link underline='hover'>Browse files</Link>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>
    </>
  );
};
