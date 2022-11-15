import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  useTheme
} from '@mui/material';
import { InfoBanner } from 'components/alerts/Banner';
import Icon from 'components/common/Icon';
import { SubHeader } from 'components/common/partials/SubHeader';
import { BannerStrings } from 'constants/strings';
import { useEffect, useState } from 'react';
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

interface KeyXPayload {
  [device_id: number]: boolean;
}

// Temporarily build components down here for development
const TempComponent = ({ deviceIds }: KeyXCardProps): JSX.Element => {
  const theme = useTheme();
  const [keyXPayload, setKeyXPayload] = useState<KeyXPayload>({});

  useEffect(() => {
    const tmp: KeyXPayload = {};
    deviceIds.forEach((device_id) => {
      //Temp code to show how setting the keyx file would work
      //Will eventually be the actual keyx file instead of boolean
      tmp[device_id] = device_id === 84789;
    });
    setKeyXPayload(tmp);
  }, [deviceIds]);

  return (
    <>
      <Card sx={{ width: '24rem' }}>
        <CardContent sx={{ paddingBottom: 0 }}>
          <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        </CardContent>
        <Box px={5} pb={2} display='flex' flexDirection='row' justifyContent='space-between'>
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Typography pb={2} fontWeight='bold'>
              Device ID
            </Typography>
            {Object.keys(keyXPayload).map((dID, i) => (
              <Typography>{dID}</Typography>
            ))}
          </Box>
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Typography pb={2} fontWeight='bold'>
              KeyX file
            </Typography>
            {Object.keys(keyXPayload).map((dID, i) => (
              <>
                {keyXPayload[dID] ? (
                  <Icon icon={'check'} htmlColor={theme.palette.success.main} />
                ) : (
                  <Link underline='hover'>Browse files</Link>
                )}
              </>
            ))}
          </Box>
        </Box>
      </Card>
    </>
  );
};
