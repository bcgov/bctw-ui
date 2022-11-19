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
  Paper,
  Tab,
  TablePagination,
  Tabs,
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

/**
 * Testing area for UI comoponents.
 * /playground route.
 */
export const DevPlayground = (): JSX.Element => {
  const [background, setBackground] = useState(false);
  const [tab, setTab] = useState(0);
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
        {/* <KeyXUploader /> */}
        <TempComponent handleTab={setTab} tab={tab} tabList={['Device and Animal', 'Telemetry', 'Vectronic KeyX']}>
          <h1>test</h1>
        </TempComponent>
      </Box>
    </ManageLayout>
  );
};

// Modify styles here
const useStyles = makeStyles((theme: Theme) => {
  const r = '8px';
  const TAB_RADIUS = `${r} ${r} 0px 0px`;
  const BOX_RADIUS = `0px ${r} ${r} ${r}`;
  const BOX_SECONDARY_RADIUS = `${r} ${r} ${r} ${r}`;
  return {
    root: { width: '100%' },
    tabs: {
      '& .MuiTabs-indicator': {
        display: 'none'
      }
    },
    tab: { borderRadius: TAB_RADIUS },
    selectedTab: { backgroundColor: theme.palette.background.paper, borderRadius: TAB_RADIUS },
    box: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      borderRadius: BOX_RADIUS
    },
    boxSecondary: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      borderRadius: BOX_SECONDARY_RADIUS
    }
  };
});

// Interfaces / Types here
interface TempComponentProps {
  tabList: string[];
  handleTab: (tabIdx: number) => void;
  tab: number;
  children?: JSX.Element;
}

// Temporarily build components down here for development
const TempComponent = ({ tabList, tab, handleTab, children }: TempComponentProps): JSX.Element => {
  const styles = useStyles();
  const firstTab = tab === 0;
  return (
    <Box className={styles.root}>
      <Tabs value={tab} className={styles.tabs} sx={{ display: 'flex' }}>
        {tabList.map((t, i) => (
          <Tab
            key={`tab-${i}`}
            label={t}
            onClick={() => handleTab(i)}
            className={tab === i ? styles.selectedTab : styles.tab}
            sx={tab === i && { boxShadow: 1, ml: 1 }}
          />
        ))}
      </Tabs>
      <Box ml={1} className={firstTab ? styles.box : styles.boxSecondary} p={2} sx={{ boxShadow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
