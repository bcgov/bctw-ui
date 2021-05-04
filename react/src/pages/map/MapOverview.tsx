import { Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { MakeEditFields } from 'components/form/create_form_components';
import { FormInputType, getInputTypesOfT } from 'components/form/form_helpers';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ModifyCritterWrapper from 'pages/data/animals/ModifyCritterWrapper';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';
import React, { useEffect, useState } from 'react';
import { Animal, critterFormFields, FormFieldObject } from 'types/animal';
import { Collar, collarFormFields } from 'types/collar';
import { BCTWType } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { eCritterPermission } from 'types/user';
import { objectCompare } from 'utils/common';
import { dateObjectToDateStr } from 'utils/time';

type CritterOverViewProps = {
  type: BCTWType;
  detail: ITelemetryDetail;
};

// critter fields to show
const { generalFields: critterGeneralFields, identifierFields: critterIdFields, locationFields: critterLocFields } = critterFormFields;
const critterMortality = ['mortality_date', 'mortalityCoords', 'mortalityUTM'];

// collar fields to show
const { generalFields: collarGeneralFields, networkFields, statusFields } = collarFormFields;

export default function MapOverView({ type, detail }: CritterOverViewProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | Collar>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);

  const { data, error, isError, status } =
    type === 'animal'
      ? bctwApi.useType<Animal>('animal', detail.critter_id)
      : bctwApi.useType<Collar>('device', detail.collar_id);

  const allFields: FormFieldObject[] = type ==='animal' ? [...critterGeneralFields, ...critterIdFields, ...critterLocFields] : [...collarGeneralFields, ...networkFields, ...statusFields];

  useEffect(() => {
    if (status === 'success') {
      if (type === 'animal') {
        setEditObj(data as Animal);
        setCanEdit((data as Animal).permission_type === eCritterPermission.change);
      } else if (type === 'device') {
        setEditObj(data as Collar);
        setCanEdit(true);
      }
      setInputTypes(
        getInputTypesOfT(
          data,
          allFields.map((a) => a.prop),
          allFields.filter(f => f.isCode).map((a) => a.prop)
        )
      );
    }
  }, [status]);


  const createFields = (props: string[]): React.ReactNode => {
    if (!editObj) {
      return;
    }
    const its = inputTypes.filter(i => props.includes(i.key));
    return its.map((i) => {
      const isRequired = true; // requiredFields.includes(iType.key);
      const errorText = ''; // hasError && (errors[iType.key] as string);
      return MakeEditFields(i, handleChange, false, editObj, isEditing, isRequired, errorText, true);
    });
  };

  // triggered on a form input change, newProp will be an object with a single key and value
  const handleChange = (newProp: Record<string, unknown>): void => {
    console.log(newProp);
    const n = Object.assign(editObj, newProp);
    // setNewObj((old) => Object.assign(old, newProp));
    // get the first key
    const key: string = Object.keys(newProp)[0];
    // create matching key/val object from the item being edited
    const og = { [key]: editObj[key] ?? '' };
    const isSame = objectCompare(newProp, og);
    // setCanSave(isChange && !isSame);
  };

  const EditButton = (
    <Button
      className={'overview-btn'}
      color='primary'
      disabled={!canEdit}
      onClick={(): void => setIsEditing((o) => !o)}
      variant='outlined'>
      Edit
    </Button>
  );

  const createSection = (fields: React.ReactNode, title: string): JSX.Element => 
    <div className={'dlg-details-section'}>
      <div className={'dlg-details-content'}>
        <h3>{title}</h3>
        {fields}
      </div>
    </div>

  if (isError) {
    return <div>{error}</div>;
  }

  if (type === 'animal') {
    // CRITTER DETAILS
    return (
      <>
        <Paper elevation={3} className={'dlg-full-title'}>
          <div>
            <h1>WLH ID: {detail.wlh_id ?? ''}</h1>
            <Button className={'dlg-title-btn'} onClick={null} variant='contained' size='small' color='primary'>
              Active
            </Button>
          </div>
          <div className={'dlg-full-sub'}>
            <span>Species: {detail.species}</span>
            <span>|</span>
            <span>Device: {detail.device_id ?? 'Unassigned'}</span>
          </div>
        </Paper>
        <Paper elevation={0} className={'dlg-full-body'}>
          <div className={'dlg-full-body-subtitle'}>
            <h2>Animal Details</h2>
            <ModifyCritterWrapper editing={editObj as Animal}>
              {EditButton}
            </ModifyCritterWrapper>
          </div>

          <Paper elevation={3} className={'dlg-full-body-details'}>
            {createSection(createFields(critterGeneralFields.map(p => p.prop)), 'General Information')}
            {(editObj as Animal)?.animal_status === 'Mortality' ?  createSection(createFields(critterMortality), 'Mortality Details') : null} 
            {createSection(createFields(critterIdFields.map(f => f.prop)), 'Identifiers')}
            {createSection(createFields(critterLocFields.map(f => f.prop)), 'Location')}
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
          <span>Deployment Status: {(editObj as Collar)?.device_deployment_status}</span>
        </div>
      </Paper>
      <Paper elevation={0} className={'dlg-full-body'}>
        <div className={'dlg-full-body-subtitle'}>
          <h2>Device Details</h2>
          <ModifyCollarWrapper editing={(editObj as Collar) ?? new Collar()}>
            {EditButton}
          </ModifyCollarWrapper>
        </div>

        <Paper elevation={3} className={'dlg-full-body-details'}>
          <div className={'dlg-details-section'}>
            <div className={'dlg-details-content'}>
              <h3>General Information</h3>
              {createFields([...collarGeneralFields, ...networkFields].map(f => f.prop))}
            </div>
          </div>
          <div className={'dlg-details-section'}>
            <div className={'dlg-details-content'}>
              <h3>Status</h3>
              {createFields(statusFields.map(f => f.prop))}
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
                <TableCell>{dateObjectToDateStr(f.capture_date)}</TableCell>
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
