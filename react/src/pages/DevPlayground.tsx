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
      //Temp stuff
      if (device_id === DEVICE_IDS[0] || device_id === DEVICE_IDS[3]) {
        tmp[device_id] = true;
      }
      setKeyXPayload(tmp);
    });
  }, [deviceIds]);
  {
    /* <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'></Box> */
  }
  return (
    <>
      <Card sx={{ width: '24rem' }}>
        <CardContent sx={{ paddingBottom: 0 }}>
          <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        </CardContent>
        <Box px={5} pb={2} display='flex' flexDirection='row' justifyContent='space-between'>
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            {deviceIds.map((id, i) => (
              <>
                {i == 0 && (
                  <Typography pb={2} fontWeight='bold'>
                    Device ID
                  </Typography>
                )}
                <Typography>{id}</Typography>
              </>
            ))}
          </Box>
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            {deviceIds.map((id, i) => (
              <>
                {i == 0 && (
                  <Typography pb={2} fontWeight='bold'>
                    KeyX file
                  </Typography>
                )}
                {keyXPayload[id] ? (
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

{
  /* <Box>
  {i == 0 && (
    <Typography pb={2} fontWeight='bold'>
    KeyX File
    </Typography>
    )}
    {keyXPayload[id] ? (
      <Icon icon={'check'} htmlColor={theme.palette.success.main} />
      ) : (
        <Link underline='hover'>Browse files</Link>
        )}
      </Box> */
}
{
  /* </Box> */
}
