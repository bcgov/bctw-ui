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
import { Collar, DeviceWithVectronicKeyX, VectronicKeyX } from 'types/collar';
import ManageLayout from './layouts/ManageLayout';
import { createFormData } from 'api/api_helpers';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';

// Place constants here
const TEST = 'Testing';
const DEVICE_IDS = [17822, 20502, 45333];
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
  //If no device_ids passed to componenet
  //component defaults to all keyX files for collars assigned to that user
  device_ids?: number[];
}

interface DeviceKeyXObj {
  [device_id: number]: VectronicKeyX;
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
  const { data, isSuccess, isLoading } = api.useGetCollarKeyX(device_ids);

  const [deviceAndKeyXList, setDeviceAndKeyXList] = useState<DeviceWithVectronicKeyX[]>([]);
  const [deviceAndKeyXObj, setDeviceAndKeyXObj] = useState<DeviceKeyXObj>({});

  const onSuccessKeyX = (response: IBulkUploadResults<VectronicKeyX>): void => {
    const { errors, results } = response;
    console.log({ errors, results });
    results.forEach((keyX) => {
      if (deviceAndKeyXObj[keyX.idcollar]) {
        const tmp = { [keyX.idcollar]: keyX };
        setDeviceAndKeyXObj((k) => ({ ...k, ...tmp }));
      }
    });
  };

  const onErrorKeyX = (e: AxiosError): void => {
    console.log(e.message);
  };

  const {
    mutateAsync: mutateKeyX,
    reset,
    isLoading: isPostingKeyX
  } = api.useUploadXML({
    onSuccess: onSuccessKeyX,
    onError: onErrorKeyX
  });

  useEffect(() => {
    if (!data?.length) return;
    const tmp: DeviceKeyXObj = {};
    setDeviceAndKeyXList(data);
    data.forEach((row) => {
      tmp[row.device_id] = row.keyx;
    });
    setDeviceAndKeyXObj(tmp);
  }, [isSuccess]);

  const handleUploadedKeyX = (name: string, files: FileList): void => {
    console.log({ name }, { files });
    const form = createFormData('xml', files);
    mutateKeyX(form);
    // setDeviceKeyXList((k) => {
    //   k[device_id] = deviceKeyXList[device_id];
    //   return { ...k };
    // });
  };

  const onBatchUpload = (): void => {
    console.log('doing nothing');
  };

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
            multiple={true}
            onFileChosen={handleUploadedKeyX}
          />
        </Box>
      </CardContent>
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
            {Object.keys(deviceAndKeyXObj).map((dID, idx) => (
              <TableRow key={`keyx-${idx}`}>
                <TableCell align='center'>{dID}</TableCell>
                <TableCell align='center'>
                  {deviceAndKeyXObj[dID] ? (
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
                      onFileChosen={handleUploadedKeyX}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
