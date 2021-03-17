import { Button, Paper } from '@material-ui/core';
import TextField from 'components/form/Input';
import { Animal } from 'types/animal';
import { ITelemetryDetail } from 'types/map';

type CritterOverViewProps = {
  detail: ITelemetryDetail;
};

const critterGeneral = ['animal_status', 'species', 'sex', 'life_stage', 'estimated_age', 'juvenile_at_heel'];
const critterIds = ['wlh_id', 'animal_id', 'nickname', 'ear_tag_left', 'ear_tag_right', 'population_unit'];
const critterLoc = ['region'];

export default function CritterOverView(props: CritterOverViewProps): JSX.Element {
  // const { isEdit, editing, editableProps, selectableProps } = props;
  const { detail } = props;

  const createFields = (props: string[], detail: ITelemetryDetail): React.ReactNode => {
    return props.map((p, idx) => {
      return (
        <TextField
          className={'text-disabled'}
          key={idx}
          propName={p}
          defaultValue={detail[p] ?? 'unknown'}
          disabled={true}
          label={new Animal().formatPropAsHeader(p)}
          changeHandler={(): void => {}}
        />
      )
    })
  }
  // const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  return (
    <>
      <Paper elevation={3} className={'dlg-full-title'}>
        <div>
          <h1>WLH ID: {detail.wlh_id ?? 'No assigned ID'}</h1>
          <Button onClick={null} color='primary' variant='contained'>Active</Button>
        </div>
        <h4>{detail.species} | {detail.animal_status}</h4>
      </Paper>
      <Paper elevation={0} className={'dlg-full-body'}>

        <div className={'dlg-full-body-subtitle'}>
          <h2>Animal Details</h2>
          <Button className={'overview-btn'} color='primary' variant='outlined'>Edit</Button>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>General Information</h3>
            {createFields(critterGeneral, detail)}
          </Paper>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>Identifiers</h3>
            {createFields(critterIds, detail)}
          </Paper>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>Location</h3>
            {createFields(critterLoc, detail)}
          </Paper>
        </Paper>

        <div className={'dlg-full-body-subtitle'}>
          <h2>Capture and Release Events</h2>
          <Button className={'overview-btn'} color='primary' variant='outlined'>Add Event</Button>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <div className={'dlg-details-section'}>
            <h3>Information</h3>
          </div>
        </Paper>

      </Paper>
    </>
  );
}
