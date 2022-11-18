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
  TablePagination,
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
import { KeyXUploader } from './vendor/KeyXUploader';

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
  root: {}
}));

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
          <KeyXUploader device_ids={DEVICE_IDS} />
        </Box>
        <KeyXUploader />
      </Box>
    </ManageLayout>
  );
};

// Interfaces / Types here
interface TempComponentProps {
  temp: boolean;
}

// Temporarily build components down here for development
const TempComponent = ({ temp }: TempComponentProps): JSX.Element => {
  return <></>;
};
