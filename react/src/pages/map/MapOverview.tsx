import { Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import TextField from 'components/form/Input';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import EditCollar from 'pages/data/collars/EditCollar';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { TypeWithData } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { eCritterPermission } from 'types/user';

type CritterOverViewProps = {
  type: TypeWithData;
  detail: ITelemetryDetail;
};

const critterGeneral = ['animal_status', 'species', 'sex', 'life_stage', 'estimated_age', 'juvenile_at_heel'];
const critterMortality = ['mortality_date', 'mortalityCoords', 'mortalityUTM'];
const critterIds = ['wlh_id', 'animal_id', 'nickname', 'ear_tag_left', 'ear_tag_right', 'population_unit'];
const critterLoc = ['region'];
//
const collarGeneral = [
  'device_make',
  'device_type',
  'device_model',
  'device_id',
  'frequency',
  'frequency_unit_code',
  'satellite_network'
];
const collarStatusFields = ['device_status', 'device_deployment_status', 'vendor_activation_status'];

export default function MapOverView({ type, detail }: CritterOverViewProps): JSX.Element {
  const [critter, setCritter] = useState<Animal>(null);
  const [collar, setCollar] = useState<Collar>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const bctwApi = useTelemetryApi();
  const { data, error, isError, status } =
    type === 'critter'
      ? bctwApi.useType<Animal>('critter', detail.critter_id)
      : bctwApi.useType<Collar>('collar', detail.collar_id);

  useEffect(() => {
    if (status === 'success') {
      if (type === 'critter') {
        setCritter(data as Animal);
        setCanEdit((data as Animal).permission_type === eCritterPermission.change);
      } else if (type === 'collar') {
        setCollar(data as Collar);
        setCanEdit(true);
      }
    }
  }, [status]);

  const createDisabledFields = (props: string[], obj: Animal | Collar): React.ReactNode => {
    return props.map((p, idx) => {
      return (
        <TextField
          className={'text-disabled'}
          key={idx}
          propName={p}
          defaultValue={obj[p] ?? ''}
          disabled={true}
          label={new Animal().formatPropAsHeader(p)}
          changeHandler={(): void => {}}
        />
      );
    });
  };

  if (isError) {
    return <div>{error}</div>;
  }

  if (type === 'critter') {
    // CRITTER DETAILS
    return (
      <>
        <Paper elevation={3} className={'dlg-full-title'}>
          <div>
            <h1>WLH ID: {detail.wlh_id ?? 'No assigned ID'}</h1>
            <Button className={'dlg-title-btn'} onClick={null} variant='contained' size='small' color='primary'>
              Active
            </Button>
          </div>
          <div className={'dlg-full-sub'}>
            <span>Species: {detail.species}</span>
            <span>|</span>
            <span>Device: {detail.device_id ?? 'Unassigned'}</span>
            {/* <span>ID: {detail.critter_id}</span> */}
          </div>
        </Paper>
        <Paper elevation={0} className={'dlg-full-body'}>
          <div className={'dlg-full-body-subtitle'}>
            <h2>Animal Details</h2>
            <ModifyCritterWrapper editing={critter}>
              <AddEditViewer<Animal>
                editing={critter ?? new Animal()}
                empty={new Animal()}
                disableAdd={true}
                editBtn={
                  <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
                    Edit
                  </Button>
                }>
                <EditCritter editing={new Animal()} open={false} onSave={null} />
              </AddEditViewer>
            </ModifyCritterWrapper>
          </div>

          <Paper elevation={3} className={'dlg-full-body-details'}>
            <div className={'dlg-details-section'}>
              <div className={'dlg-details-content'}>
                <h3>General Information</h3>
                {critter ? createDisabledFields(critterGeneral, critter) : null}
              </div>
            </div>
            {critter?.animal_status === 'Mortality' ? (
              <div className={'dlg-details-section'}>
                <div className={'dlg-details-content'}>
                  <h3>Mortality Details</h3>
                  {critter ? createDisabledFields(critterMortality, critter) : null}
                </div>
              </div>
            ) : null}
            <div className={'dlg-details-section'}>
              <div className={'dlg-details-content'}>
                <h3>Identifiers</h3>
                {critter ? createDisabledFields(critterIds, critter) : null}
              </div>
            </div>
            <div className={'dlg-details-section'}>
              <div className={'dlg-details-content'}>
                <h3>Location</h3>
                {critter ? createDisabledFields(critterLoc, critter) : null}
              </div>
            </div>
          </Paper>
          <div className={'dlg-full-body-subtitle'}>
            <h2>Capture and Release Events</h2>
            <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
              Add Event
            </Button>
          </div>

          <Paper elevation={3} className={'dlg-full-body-details'}>
            <div className={'dlg-details-section'}>
              <SpecialEvent critter_id={detail.critter_id} collar_id={null} type={'capture'} />
            </div>
          </Paper>
        </Paper>
      </>
    );
  }
  // COLLAR DETAILS
  return (
    <>
      <Paper elevation={3} className={'dlg-full-title'}>
        <div>
          <h1>Device ID: {detail.device_id}</h1>
        </div>
        <div className={'dlg-full-sub'}>
          <span>Frequency: {detail.frequency}</span>
          <span>|</span>
          <span>Deployment Status: {collar?.device_deployment_status}</span>
        </div>
      </Paper>
      <Paper elevation={0} className={'dlg-full-body'}>
        <div className={'dlg-full-body-subtitle'}>
          <h2>Device Details</h2>
          <ModifyCollarWrapper editing={collar ?? new Collar()}>
            <AddEditViewer<Collar>
              editing={collar ?? new Collar()}
              empty={new Collar()}
              disableAdd={true}
              editBtn={
                <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
                  Edit
                </Button>
              }>
              <EditCollar editing={new Collar()} open={false} onSave={(): void => { /* do nothing */}} />
            </AddEditViewer>
          </ModifyCollarWrapper>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <div className={'dlg-details-section'}>
            <div className={'dlg-details-content'}>
              <h3>General Information</h3>
              {collar ? createDisabledFields(collarGeneral, collar) : null}
            </div>
          </div>
          <div className={'dlg-details-section'}>
            <div className={'dlg-details-content'}>
              <h3>Status</h3>
              {collar ? createDisabledFields(collarStatusFields, collar) : null}
            </div>
          </div>
        </Paper>

        <div className={'dlg-full-body-subtitle'}>
          <h2>Device Events</h2>
          <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
            Add Event
          </Button>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <div className={'dlg-details-section'}>
            <SpecialEvent critter_id={null} collar_id={detail.collar_id} type={'malfunction'} />
          </div>
        </Paper>
      </Paper>
    </>
  );
}

type ISpecialEventProps = {
  type: 'malfunction' | 'capture';
  collar_id: string;
  critter_id: string;
};
function SpecialEvent({ critter_id, collar_id, type }: ISpecialEventProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const { data, status, error } =
    type === 'capture' ? bctwApi.useCritterHistory(1, critter_id) : bctwApi.useCollarHistory(1, collar_id);

  switch (status) {
    case 'loading':
      return <div>loading...</div>;
    case 'error':
      return (
        <div>
          unable to load {type === 'capture' ? 'capture' : 'malfunction'} history: {error}
        </div>
      );
    default:
      break;
  }
  const filtered =
    type === 'capture'
      ? (data as Animal[]).filter((a) => a.capture_date)
      : (data as Collar[]).filter((c) => c.malfunction_date);
  if (!filtered.length) {
    return <div>history contains no events</div>;
  }
  return (
    <Table>
      <TableHead>
        {type === 'capture' ? (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>UTM</TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        )}
      </TableHead>
      <TableBody>
        {type === 'capture'
          ? (filtered as Animal[]).map((f) => (
              <TableRow key={f.critter_id}>
                <TableCell>{f.capture_date}</TableCell>
                <TableCell>{f.captureCoords}</TableCell>
                <TableCell>{f.captureUTM}</TableCell>
              </TableRow>
            ))
          : (filtered as Collar[]).map((c) => (
              <TableRow key={c.collar_id}>
                <TableCell>{c.malfunction_date}</TableCell>
                <TableCell>{c.device_malfunction_type}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
