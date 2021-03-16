import { Button, Paper, Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import { getInputTypesOfT, InputType, validateRequiredFields } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import { useEffect, useState } from 'react';
import { Animal } from 'types/animal';
import { ITelemetryDetail } from 'types/map';
import { eCritterPermission } from 'types/user';
import { columnToHeader, removeProps } from 'utils/common';

type CritterOverViewProps = {
  detail: ITelemetryDetail;
};

const critterGeneral = ['animal_status', 'species', 'sex', 'life_stage', 'estimated_age', 'juvenile_at_heel'];
const critterIds = ['wlh_id', 'animal_id', 'nickname', 'ear_tag_left', 'ear_tag_right', 'population_unit'];
const critterLoc = ['region'];
export default function CritterOverView(props: CritterOverViewProps): JSX.Element {
  // const { isEdit, editing, editableProps, selectableProps } = props;
  const { detail } = props;

  const createFields = (props: string[], detail: ITelemetryDetail) => {
    return props.map((p, idx) => {
      return (
        <TextField
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

  // const [errors, setErrors] = useState<Record<string, unknown>>({});
  // const [inputTypes, setInputTypes] = useState<{ key: string; type: InputType; value: unknown }[]>([]);

  return (
    <>
      <Paper elevation={3} className={'dlg-full-title'}>
        <div>
          <h1>WLH ID: {detail.wlh_id ?? 'No assigned ID'}</h1>
          <Button color='primary' variant='contained'>Active</Button>
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
