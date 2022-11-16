import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  useTheme
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { InfoBanner } from 'components/alerts/Banner';
import Icon from 'components/common/Icon';
import { SubHeader } from 'components/common/partials/SubHeader';
import Tooltip from 'components/common/Tooltip';
import FileInput from 'components/form/FileInput';
import { BannerStrings } from 'constants/strings';
import { useEffect, useState } from 'react';
import { Collar } from 'types/collar';
import ManageLayout from './layouts/ManageLayout';
// Place component constants / objects here

const TEST = 'Testing';
const DEVICE_IDS = [84789, 12345, 98765, 223344];
const TEST_KEYX_PAYLOAD = {
  84789: true,
  12345: false,
  98789: true
};
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
        <TempComponent keyXs={TEST_KEYX_PAYLOAD} />
      </Box>
    </ManageLayout>
  );
};

interface KeyXCardProps {
  keyXs: KeyXPayload;
}

interface KeyXPayload {
  [device_id: number]: boolean;
}

// Temporarily build components down here for development
const TempComponent = ({ keyXs }: KeyXCardProps): JSX.Element => {
  const theme = useTheme();
  const [keyXPayload, setKeyXPayload] = useState<KeyXPayload>(keyXs);

  const handleSetPayload = (device_id: number): void => {
    setKeyXPayload((k) => {
      k[device_id] = true;
      return { ...k };
    });
  };

  const doNothing = (): void => {
    console.log('doing nothing');
  };

  const KeyXList = (): JSX.Element => (
    <TableContainer sx={{ pb: 4 }}>
      <Table
        size='small'
        sx={{
          [`& .${tableCellClasses.root}`]: {
            borderBottom: 'none'
          }
        }}>
        <TableHead>
          <TableRow>
            <TableCell align='center'>
              <Typography fontWeight='bold'>Devices</Typography>
            </TableCell>
            <TableCell align='center'>
              <Typography fontWeight='bold'>KeyX Files</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(keyXPayload).map((device_id, idx) => (
            <TableRow key={`keyx-${idx}`}>
              <TableCell align='center'>{device_id}</TableCell>
              <TableCell align='center'>
                {keyXPayload[device_id] ? (
                  <Tooltip title={'Existing KeyX file for this device'}>
                    <Icon icon={'check'} htmlColor={theme.palette.success.main} />
                  </Tooltip>
                ) : (
                  <FileInput
                    accept='.keyx'
                    buttonText={'Browse Files'}
                    buttonVariant='text'
                    fileName={''}
                    multiple={false}
                    onFileChosen={() => handleSetPayload(parseInt(device_id))}
                  />
                  // <Link component='button' underline='hover' onClick={() => handleSetPayload(parseInt(device_id))}>
                  //   Browse files
                  // </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Card sx={{ width: '24rem' }}>
        <CardContent sx={{ paddingBottom: 0 }}>
          <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        </CardContent>
        <KeyXList />
      </Card>
    </>
  );
};
