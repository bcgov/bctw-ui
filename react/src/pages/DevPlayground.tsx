/* eslint-disable */
import { Box, Button, Grid, Paper, TextField, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { classToPlain, plainToClass } from 'class-transformer';
import { SubHeader } from 'components/common/partials/SubHeader';
import { formatTag } from 'components/table/table_helpers';
import { CbCollectionUnitInputs } from 'critterbase/components/CbCollectionUnitInputs';
import { CbMarkingInput, CbMarkings } from 'critterbase/components/CbMarkingInputs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { AttachedCritter, Critter, IMarking } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import { editObjectToEvent } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import { columnToHeader, doNothingAsync } from 'utils/common_helpers';
import EditCritter from './data/animals/EditCritter';
import ModifyCritterWrapper from './data/animals/ModifyCritterWrapper';
import WorkflowWrapper from './data/events/WorkflowWrapper';
import ManageLayout from './layouts/ManageLayout';

// Place constants here
const TEST = 'Testing';
const DEVICE_IDS = [17822, 20502, 45333];
const TEST_KEYX_PAYLOAD = {
  84789: true,
  12345: false,
  98789: true
};
const TAB_LIST = ['Device and Critter', 'Telemetry', 'Vectronic KeyX'];

const editCritter = editObjectToEvent(
  {
    capture: [
      {
        capture_comment: 'test',
        capture_location: { latitude: 1, longitude: 2, coordinate_uncertainty_unit: 'm' },
        release_location: { latitude: 2, longitude: 3 }
      }
    ],
    mortality: [
      {
        location: { latitude: 8, longitude: 9 }
      }
    ],
    collection_units: [
      // {
      //   category_name: 'Population Unit',
      //   unit_name: 'Itcha-Ilgachuz',
      //   collection_unit_id: 'a87e9e57-6c94-49e9-9aa9-4925833eaed3',
      //   collection_category_id: '86552ac7-75aa-4402-bba3-d33b11dc04d7'
      // }
      // {
      //   category_name: 'Dummy Unit',
      //   unit_name: 'Name 1',
      //   collection_unit_id: '595434b1-2cde-44f5-afea-b59432aa705f',
      //   collection_category_id: '841fbf8d-d3c1-4b4f-871b-3b4dcfd5ed03'
      // }
    ],
    marking: [
      // {
      //   marking_id: 'a',
      //   identifier: 'id 1',
      //   marking_type: 'f00170b8-853c-466a-917e-2b20ec194d6a',
      //   order: 1,
      //   // body_location: 'ec06df9b-1082-4178-a25d-2cec7e9025af',
      //   marking_material: '283fe4cc-0087-408c-8186-24e22d93db28',
      //   primary_colour: '3f1aec14-5afb-4f55-9115-bf21217d5824',
      //   secondary_colour: '3f1aec14-5afb-4f55-9115-bf21217d5824',
      //   text_colour: '3f1aec14-5afb-4f55-9115-bf21217d5824',
      //   comment: 'marking comment'
      // }
    ],
    wlh_id: '12-345',
    sex: 'Male',
    taxon: 'Moose',
    animal_id: 'Bert',
    region_env_id: '123',
    wmu_id: '1-10',
    critter_comment: 'this is the critter comment'
  },
  new AttachedCritter('4bd8fe08-f0e1-41fd-99b3-494fab00a763'),
  []
);

/**
 * Testing area for UI comoponents.
 * /playground route.
 */
const DevPlayground = (): JSX.Element => {
  const api = useTelemetryApi();
  const [background, setBackground] = useState(false);
  const [tab, setTab] = useState(0);
  const [detailAnimal, setDetailAnimal] = useState<AttachedCritter>(null);
  const [openCapture, setCapture] = useState(false);
  const [openMortality, setMortality] = useState(false);
  const [openCritter, setOpenCritter] = useState(false);
  const [obj, setObj] = useState<any>({ a: 1 });
  // const { data, status } = api.useType<AttachedCritter>('animal', 'c6b0a6c7-71ca-421a-96d6-1878fec07b05');
  // console.log(data);
  const toObject = (o) => {
    const res = {}; //or Object.create(null)
    for (const key in o) res[key] = o[key];
    return res;
  };
  useEffect(() => {
    console.log(obj);
  }, [JSON.stringify(obj)]);
  return (
    <ManageLayout>
      <h1>Dev Playground</h1>
      <Box pb={2} display='flex' justifyContent='space-between'>
        <SubHeader text={'Component Development and Testing Area'} />
        <Button variant='contained' onClick={() => setBackground((b) => !b)}>
          {`White Background - ${background}`}
        </Button>
      </Box>
      <Button
        variant='contained'
        onClick={() => {
          setCapture(true);
        }}>
        Open Capture
      </Button>
      <Button
        variant='contained'
        onClick={() => {
          setOpenCritter(true);
        }}>
        Open Edit Critter
      </Button>
      <Button
        variant='contained'
        onClick={() => {
          setMortality(true);
        }}>
        Open Mortality
      </Button>
      <Box sx={{ backgroundColor: background ? '#ffff' : 'transparent', display: 'flex', flexDirection: 'row' }}>
        {/* Place components below here */}
        {/* <TempComponent handleTab={setTab} tab={tab} tabList={TAB_LIST}>
          <>
            <h1>{TAB_LIST[tab]}</h1>
            <SubHeader text={'Placeholder text'} />
          </>
        </TempComponent> */}
        <Box my={5}></Box>
        <Box my={5}>
          <Button
            onClick={() => {
              const tmp2 = editObjectToEvent(obj, new CaptureEvent2(), []);
              const t = classToPlain(tmp2);
              setObj({ ...t, capture_comment: `${Math.random()}` });
            }}>
            spread obj test
          </Button>
        </Box>
        <ModifyCritterWrapper editing={editCritter}>
          <EditCritter
            open={openCritter} // THIS is false
            editing={null}
            handleClose={(): void => setOpenCritter(false)}
            onSave={doNothingAsync}
          />
        </ModifyCritterWrapper>

        <WorkflowWrapper
          open={openCapture}
          event={editObjectToEvent(
            plainToClass(Critter, {
              critter_id: 'c6b0a6c7-71ca-421a-96d6-1878fec07b05',
              taxon: 'Moose',
              wlh_id: '12-345'
            }),
            new CaptureEvent2(),
            []
          )}
          handleClose={(): void => setCapture(false)}
          onEventSaved={(e) => console.log(e.critterbasePayload)}
          onEventChain={() => console.log('chain')}
        />

        <WorkflowWrapper
          open={openMortality}
          event={editObjectToEvent(
            {
              critter_id: 'c6b0a6c7-71ca-421a-96d6-1878fec07b05',
              taxon: 'Moose',
              wlh_id: '12-345'
            },
            new MortalityEvent(),
            []
          )}
          handleClose={(): void => setMortality(false)}
          onEventSaved={(e) => {
            console.log('Saved Event');
            console.log(e.critterbasePayload);
          }}
          onEventChain={() => console.log('chain')}
        />

        {/* <Box flexDirection='column'>
          {Object.keys(CbRoutes).map((key) => (
            <CbSelect
              prop={key}
              value={''}
              handleChange={() => {}}
              key={key}
              cbRouteKey={key as ICbRouteKey}
              required={false}
            />
          ))}
        </Box> */}

        {/* <CritterDataTables detailViewAction={setDetailAnimal} /> */}
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
// const TempComponent = ({ tabList, tab, handleTab, children }: TempComponentProps): JSX.Element => {
//   const styles = useStyles();
//   const theme = useTheme();
//   const firstTab = tab === 0;
//   const tabIsSelected = (t: number): boolean => tab === t;

//   const testAnimal: Critter = new Critter();
//   testAnimal.taxon = 'Caribou';
//   testAnimal.critter_status = eCritterStatus.alive;
//   testAnimal.wlh_id = '12345';
//   testAnimal.animal_id = 'BC78301';
//   testAnimal.collection_unit = [{ 'Population Unit': 'testing' }];
//   testAnimal.sex = 'Female';
//   testAnimal.capture_date = dayjs('2022-07-02');
//   testAnimal.mortality_date = null;
//   testAnimal.animal_comment = `I've never had to knock on wood
//   But I know someone who has
//   Which makes me wonder if I could
//   It makes me wonder if I've
//   Never had to knock on wood
//   And I'm glad I haven't yet
//   Because I'm sure it isn't good
//   That's the impression that I get
//   Have you ever had the odds stacked up so high
// You need a strength most don't possess?
// Or has it ever come down to do or die?
// You've got to rise above the rest
// No, well`;

//   const testDevice: AttachedCollar = new AttachedCollar();
//   testDevice.device_id = 12345;
//   testDevice.device_status = 'Mortality';
//   testDevice.device_type = 'GPS';
//   testDevice.last_fetch_date = dayjs('2022-07-02');
//   testDevice.device_make = 'Vectronic';
//   testDevice.frequency = 192.18;
//   testDevice.attachment_start = dayjs('2022-07-02');
//   testDevice.attachment_end = dayjs('2022-07-02');
//   testDevice.activation_comment = `I've never had to knock on wood
// But I know someone who has
// Which makes me wonder if I could
// It makes me wonder if I've
// Never had to knock on wood
// And I'm glad I haven't yet
// Because I'm sure it isn't good
// That's the impression that I get
// Have you ever had the odds stacked up so high
// You need a strength most don't possess?
// Or has it ever come down to do or die?
// You've got to rise above the rest
// No, well`;

//   return (
//     <Box width='100%' sx={{ ml: -1 }}>
//       <Grid container xs={12} spacing={4}>
//         <Grid item xs={6}>
//           <SubHeader size='small' text='Critter Details' />
//           <DetailedStatusCard
//             displayObject={testAnimal}
//             displayKeysInGrid={[
//               'taxon',
//               'critter_status',
//               'wlh_id',
//               'animal_id',
//               'collection_unit',
//               'sex',
//               'capture_date',
//               'mortality_date'
//             ]}
//             displayKeysInBox={['animal_comment']}
//           />
//         </Grid>
//         <Grid item xs={6}>
//           <SubHeader size='small' text='Deployment Details' />
//           <DetailedStatusCard
//             displayObject={testDevice}
//             displayKeysInGrid={[
//               'device_id',
//               'device_status',
//               'device_type',
//               'last_fetch_date',
//               'device_make',
//               'frequency',
//               'attachment_start',
//               'attachment_end'
//             ]}
//             displayKeysInBox={['activation_comment']}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

export default DevPlayground;
