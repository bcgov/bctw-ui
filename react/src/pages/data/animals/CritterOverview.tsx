import { Button, Paper } from '@material-ui/core';
import TextField from 'components/form/Input';
import { CritterStrings as CS } from 'constants/strings';
import { Animal } from 'types/animal';
import { ITelemetryDetail } from 'types/map';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, useEffect } from 'react';
import { eCritterPermission } from 'types/user';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import AddEditViewer from '../common/AddEditViewer';
import EditCritter from './EditCritter';

type CritterOverViewProps = {
  detail: ITelemetryDetail;
};

const critterGeneral = ['animal_status', 'species', 'sex', 'life_stage', 'estimated_age', 'juvenile_at_heel'];
const critterIds = ['wlh_id', 'animal_id', 'nickname', 'ear_tag_left', 'ear_tag_right', 'population_unit'];
const critterLoc = ['region'];

export default function CritterOverView({ detail }: CritterOverViewProps): JSX.Element {
  const [critter, setCritter] = useState<Animal>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const bctwApi = useTelemetryApi();
  const { data, error, isError, status } = bctwApi.useType<Animal>('critter', detail.critter_id);

  useEffect(() => {
    if (status === 'success') {
      // console.log('critter overview: retrieved critter');
      setCritter(data);
      setCanEdit(data.permission_type === eCritterPermission.change);
    }
  }, [status]);

  const createFields = (props: string[], animal: Animal): React.ReactNode => {
    return props.map((p, idx) => {
      return (
        <TextField
          className={'text-disabled'}
          key={idx}
          propName={p}
          defaultValue={animal[p] ?? 'unknown'}
          disabled={true}
          label={new Animal().formatPropAsHeader(p)}
          changeHandler={(): void => {}}
        />
      );
    });
  };
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
          <ModifyCritterWrapper editing={critter} onDelete={null}>
            <AddEditViewer<Animal>
              editing={critter ?? new Animal()}
              empty={new Animal()}
              disableAdd={true}
              editBtn={<Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>Edit</Button>}
            >
              <EditCritter
                editableProps={CS.editableProps}
                editing={new Animal()}
                open={false}
                onSave={() => {}}
                selectableProps={critterGeneral.slice(0, 3)}
              />
            </AddEditViewer>
          </ModifyCritterWrapper>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>General Information</h3>
            {critter ? createFields(critterGeneral, critter) : null}
          </Paper>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>Identifiers</h3>
            {critter ? createFields(critterIds, critter) : null}
          </Paper>
          <Paper elevation={2} className={'dlg-details-section'}>
            <h3>Location</h3>
            {critter ? createFields(critterLoc, critter) : null}
          </Paper>
        </Paper>

        <div className={'dlg-full-body-subtitle'}>
          <h2>Capture and Release Events</h2>
          <Button disabled={!canEdit} className={'overview-btn'} color='primary' variant='outlined'>
            Add Event
          </Button>
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
