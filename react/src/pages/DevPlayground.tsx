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
import MortalityEventForm from './data/events/MortalityEventFormNew';
import MortalityEvent from 'types/events/mortality_event';

// Place constants here
const TEST = 'Testing';
const DEVICE_IDS = [17822, 20502, 45333];
const TEST_KEYX_PAYLOAD = {
  84789: true,
  12345: false,
  98789: true
};
const TAB_LIST = ['Report an Animal Mortality', 'Remove a Device from an Animal'];
const TAB_CAPTIONS = ['You are about to report the following animal as deceased. Please confirm that these details are correct and make necessary edits before proceeding.', 
                      'You are about to end the following animal-device deployment. Please confirm that these details are correct and make necessary edits before removing the device.'];
const TAB_EVENTS = [new MortalityEvent, null];

/**
 * Testing area for UI comoponents.
 * /playground route.
 */
const DevPlayground = (): JSX.Element => {
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
        <TempComponent handleTab={setTab} tab={tab} tabList={TAB_LIST}>
          <>
            <h1>{TAB_LIST[tab]}</h1>
            <SubHeader text={TAB_CAPTIONS[tab]} />
            <MortalityEventForm event={TAB_EVENTS[tab]} handleFormChange={null}/>
          </>
        </TempComponent>
        {/* <Box sx={{ pr: 2 }}>
          <KeyXUploader device_ids={DEVICE_IDS} />
        </Box> */}
        {/* <KeyXUploader /> */}
      </Box>
    </ManageLayout>
  );
};

// Modify styles here
const r = '8px';
const TAB_RADIUS = `${r} ${r} 0px 0px`;
const BOX_RADIUS = `0px ${r} ${r} ${r}`;
const BOX_SECONDARY_RADIUS = `${r} ${r} ${r} ${r}`;
const useStyles = makeStyles((theme: Theme) => {
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
  const theme = useTheme();
  const firstTab = tab === 0;
  const tabIsSelected = (t: number): boolean => tab === t;
  return (
    <Box width='100%' sx={{ ml: -1 }}>
      <Tabs
        value={tab}
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}>
        {tabList.map((t, i) => (
          <Tab
            key={`tab-${i}`}
            label={t}
            onClick={() => handleTab(i)}
            sx={{
              boxShadow: tabIsSelected(i) ? 1 : 0,
              backgroundColor: tabIsSelected(i) && theme.palette.background.paper,
              borderRadius: TAB_RADIUS,
              ml: 1
            }}
          />
        ))}
      </Tabs>
      <Box
        p={2}
        sx={{
          boxShadow: 1,
          ml: 1,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: firstTab ? BOX_RADIUS : BOX_SECONDARY_RADIUS
        }}>
        {children}
      </Box>
    </Box>
  );
};

export default DevPlayground;
