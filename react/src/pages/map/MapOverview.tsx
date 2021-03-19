import { Button, Paper } from '@material-ui/core';
import TextField from 'components/form/Input';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import EditCollar from 'pages/data/collars/EditCollar';
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
const critterIds = ['wlh_id', 'animal_id', 'nickname', 'ear_tag_left', 'ear_tag_right', 'population_unit'];
const critterLoc = ['region'];

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
          defaultValue={obj[p] ?? 'unknown'}
          disabled={true}
          label={new Animal().formatPropAsHeader(p)}
          changeHandler={(): void => {}}
        />
      );
    });
  };

  if (type === 'critter') {
    // CRITTER DETAILS
    return (
      <>
        <Paper elevation={3} className={'dlg-full-title'}>
          <div>
            <h1>WLH ID: {detail.wlh_id ?? 'No assigned ID'}</h1>
            <Button onClick={null} color='primary' variant='contained'>
              Active
            </Button>
          </div>
          <h4>
            {detail.species} | {detail.animal_status} | <i>{detail.critter_id}</i>
          </h4>
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
            <Paper elevation={2} className={'dlg-details-section'}>
              <h3>General Information</h3>
              {critter ? createDisabledFields(critterGeneral, critter) : null}
            </Paper>
            <Paper elevation={2} className={'dlg-details-section'}>
              <h3>Identifiers</h3>
              {critter ? createDisabledFields(critterIds, critter) : null}
            </Paper>
            <Paper elevation={2} className={'dlg-details-section'}>
              <h3>Location</h3>
              {critter ? createDisabledFields(critterLoc, critter) : null}
            </Paper>
          </Paper>

          <div className={'dlg-full-body-subtitle'}>
            <h2>Capture and Release Events</h2>
            <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
              Add Event
            </Button>
          </div>

          <Paper elevation={3} className={'dlg-full-body-details'}>
            <div className={'dlg-details-section'}></div>
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
          <h1>Collar ID: {detail.device_id}</h1>
        </div>
        <h4>
          {detail.frequency} | {collar?.device_deployment_status} | <i>{detail.collar_id}</i>
        </h4>
      </Paper>
      <Paper elevation={0} className={'dlg-full-body'}>
        <div className={'dlg-full-body-subtitle'}>
          <h2>Device Details</h2>
          <AddEditViewer<Collar>
            editing={collar ?? new Collar()}
            empty={new Collar()}
            disableAdd={true}
            editBtn={
              <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
                Edit
              </Button>
            }>
            <EditCollar editing={new Collar()} open={false} onSave={() => {}} />
          </AddEditViewer>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>General Information</h3>
            {collar ? createDisabledFields(collarGeneral, collar) : null}
          </Paper>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>Status</h3>
            {collar ? createDisabledFields(collarStatusFields, collar) : null}
          </Paper>
        </Paper>

        <div className={'dlg-full-body-subtitle'}>
          <h2>Malfunction Events</h2>
          <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
            Add Event
          </Button>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <div className={'dlg-details-section'}></div>
        </Paper>
      </Paper>
    </>
  );
}
