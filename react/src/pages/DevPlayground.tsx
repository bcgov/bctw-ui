import { Box, Button, Grid, Paper, Theme, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from 'components/common/partials/SubHeader';
import { formatTag } from 'components/table/table_helpers';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Animal, AttachedAnimal, eCritterStatus } from 'types/animal';
import { AttachedCollar } from 'types/collar';
import { columnToHeader } from 'utils/common_helpers';
import { CritterDataTables } from './data/animals/CritterDataTables';
import ManageLayout from './layouts/ManageLayout';

// Place constants here
const TEST = 'Testing';
const DEVICE_IDS = [17822, 20502, 45333];
const TEST_KEYX_PAYLOAD = {
  84789: true,
  12345: false,
  98789: true
};
const TAB_LIST = ['Device and Animal', 'Telemetry', 'Vectronic KeyX'];

/**
 * Testing area for UI comoponents.
 * /playground route.
 */
const DevPlayground = (): JSX.Element => {
  const [background, setBackground] = useState(false);
  const [tab, setTab] = useState(0);
  const [detailAnimal, setDetailAnimal] = useState<AttachedAnimal>(null);

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
        {/* <TempComponent handleTab={setTab} tab={tab} tabList={TAB_LIST}>
          <>
            <h1>{TAB_LIST[tab]}</h1>
            <SubHeader text={'Placeholder text'} />
          </>
        </TempComponent> */}
        <CritterDataTables detailViewAction={setDetailAnimal} />
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

interface DetailedStatusCardProps<T> {
  displayObject: T;
  displayKeysInGrid: Array<keyof T>;
  displayKeysInBox: Array<keyof T>;
}

const DetailedStatusCard = <T,>({
  displayObject,
  displayKeysInGrid,
  displayKeysInBox
}: DetailedStatusCardProps<T>): JSX.Element => {
  return (
    <Paper sx={{ padding: '16px' }}>
      <Grid container xs={12} spacing={2}>
        {displayKeysInGrid.map((m) => {
          return (
            <>
              <Grid item xs={6} spacing={2}>
                <SubHeader size='small' text={columnToHeader(m as string)} />
                {['taxon', 'device_status'].includes(m as string) ? (
                  formatTag(m as string, String(displayObject[m]))
                ) : (
                  <Typography>
                    {displayObject[m] === undefined || displayObject[m] === null ? 'None' : String(displayObject[m])}
                  </Typography>
                )}
              </Grid>
            </>
          );
        })}
        {displayKeysInBox.map((m) => {
          return (
            <>
              <Grid item xs={12}>
                <SubHeader size='small' text={columnToHeader(m as string)} />
                <Box maxHeight={'100px'} overflow={'auto'}>
                  <Typography>{displayObject[m]}</Typography>
                </Box>
              </Grid>
            </>
          );
        })}
      </Grid>
    </Paper>
  );
};

// Temporarily build components down here for development
const TempComponent = ({ tabList, tab, handleTab, children }: TempComponentProps): JSX.Element => {
  const styles = useStyles();
  const theme = useTheme();
  const firstTab = tab === 0;
  const tabIsSelected = (t: number): boolean => tab === t;

  const testAnimal: Animal = new Animal();
  testAnimal.taxon = 'Caribou';
  testAnimal.critter_status = eCritterStatus.alive;
  testAnimal.wlh_id = '12345';
  testAnimal.animal_id = 'BC78301';
  testAnimal.population_unit = 'Calendar';
  testAnimal.sex = 'Female';
  testAnimal.capture_date = dayjs('2022-07-02');
  testAnimal.mortality_date = null;
  testAnimal.animal_comment = `I've never had to knock on wood
  But I know someone who has
  Which makes me wonder if I could
  It makes me wonder if I've
  Never had to knock on wood
  And I'm glad I haven't yet
  Because I'm sure it isn't good
  That's the impression that I get
  Have you ever had the odds stacked up so high
You need a strength most don't possess?
Or has it ever come down to do or die?
You've got to rise above the rest
No, well`;

  const testDevice: AttachedCollar = new AttachedCollar();
  testDevice.device_id = 12345;
  testDevice.device_status = 'Mortality';
  testDevice.device_type = 'GPS';
  testDevice.last_fetch_date = dayjs('2022-07-02');
  testDevice.device_make = 'Vectronic';
  testDevice.frequency = 192.18;
  testDevice.attachment_start = dayjs('2022-07-02');
  testDevice.attachment_end = dayjs('2022-07-02');
  testDevice.activation_comment = `I've never had to knock on wood
But I know someone who has
Which makes me wonder if I could
It makes me wonder if I've
Never had to knock on wood
And I'm glad I haven't yet
Because I'm sure it isn't good
That's the impression that I get
Have you ever had the odds stacked up so high
You need a strength most don't possess?
Or has it ever come down to do or die?
You've got to rise above the rest
No, well`;

  return (
    <Box width='100%' sx={{ ml: -1 }}>
      <Grid container xs={12} spacing={4}>
        <Grid item xs={6}>
          <SubHeader size='small' text='Animal Details' />
          <DetailedStatusCard
            displayObject={testAnimal}
            displayKeysInGrid={[
              'taxon',
              'critter_status',
              'wlh_id',
              'animal_id',
              'population_unit',
              'sex',
              'capture_date',
              'mortality_date'
            ]}
            displayKeysInBox={['animal_comment']}
          />
        </Grid>
        <Grid item xs={6}>
          <SubHeader size='small' text='Deployment Details' />
          <DetailedStatusCard
            displayObject={testDevice}
            displayKeysInGrid={[
              'device_id',
              'device_status',
              'device_type',
              'last_fetch_date',
              'device_make',
              'frequency',
              'attachment_start',
              'attachment_end'
            ]}
            displayKeysInBox={['activation_comment']}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DevPlayground;
