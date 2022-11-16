import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  Theme,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { Collar } from 'types/collar';
import ManageLayout from './layouts/ManageLayout';

// Place constants here
const TEST = 'Testing';
const DEVICE_IDS = [17822, 20502];
const TEST_KEYX_PAYLOAD = {
  84789: true,
  12345: false,
  98789: true
};

// Modify styles here
const useStyles = makeStyles((theme: Theme) => ({
  table: {
    [`& .${tableCellClasses.root}`]: {
      borderBottom: 'none'
    }
  },
  batchUploadBox: {
    border: '3px dashed grey',
    minWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardWidth: {
    width: '24rem'
  }
}));

// Interfaces / Types here
interface KeyXCardProps {
  device_ids?: number[]; //Array of device_ids;
}

interface KeyXDeviceList {
  [device_id: number]: boolean;
}

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
      <Box sx={{ backgroundColor: background ? '#ffff' : 'transparent', display: 'flex', flexDirection: 'row' }}>
        {/* Place components below here */}
        <Box sx={{ pr: 2 }}>
          <TempComponent device_ids={DEVICE_IDS} />
        </Box>
        <TempComponent />
      </Box>
    </ManageLayout>
  );
};

// Temporarily build components down here for development
//Two types of this component
// 1. That queries based off a list of device_ids provided
// 2. One that queries all the devices that are assigned to a user
const TempComponent = ({ device_ids }: KeyXCardProps): JSX.Element => {
  const api = useTelemetryApi();
  const theme = useTheme();
  const styles = useStyles();

  const [keyXPayload, setKeyXPayload] = useState<KeyXDeviceList>({});
  const [deviceKeyXList, setDeviceKeyXList] = useState<KeyXDeviceList>({});
  const { data, isSuccess, isLoading } = api.useGetCollarKeyX(device_ids);

  useEffect(() => {
    const tmp: KeyXDeviceList = {};
    if (!data?.length) {
      return;
    }
    console.log(data);
    data.forEach((row) => {
      tmp[row.device_id] = row?.keyx;
    });
    setDeviceKeyXList(tmp);
  }, [isSuccess]);

  const handleSetPayload = (device_id: number): void => {
    setDeviceKeyXList((k) => {
      k[device_id] = true;
      return { ...k };
    });
  };

  const onBatchUpload = (): void => {
    console.log('doing nothing');
  };

  const KeyXList = (): JSX.Element => (
    <TableContainer sx={{ pb: 4 }}>
      <Table size='small' className={styles.table}>
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
          {Object.keys(deviceKeyXList).map((device_id, idx) => (
            <TableRow key={`keyx-${idx}`}>
              <TableCell align='center'>{device_id}</TableCell>
              <TableCell align='center'>
                {deviceKeyXList[device_id] ? (
                  <Tooltip title={'Existing KeyX file for this device'}>
                    <Icon icon={'check'} htmlColor={theme.palette.success.main} />
                  </Tooltip>
                ) : (
                  <FileInput
                    accept='.keyx'
                    buttonText={'Upload KeyX'}
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
    <Card className={styles.cardWidth}>
      <CardContent>
        <InfoBanner text={BannerStrings.vectronicKeyxInfo} />
        <Box p={1} className={styles.batchUploadBox}>
          <FileInput
            accept='.keyx'
            buttonText={'Batch Upload KeyX Files'}
            buttonVariant='text'
            fileName={''}
            multiple={false}
            onFileChosen={onBatchUpload}
          />
        </Box>
      </CardContent>
      <KeyXList />
    </Card>
  );
};
