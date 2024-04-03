import { Box, Divider, Grid, Typography } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import ChangeContext from 'contexts/InputChangeContext';
import { CbCollectionUnitInputs } from 'critterbase/components/CbCollectionUnitInputs';
import { CbMarkings } from 'critterbase/components/CbMarkingInputs';
import { ICbRouteKey } from 'critterbase/types';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { QueryStatus } from 'react-query';
import { AttachedCritter, Critter, IMarking, critterFormFields } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import MortalityEvent from 'types/events/mortality_event';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import { columnToHeader, hasChangedProperties, omitNull } from 'utils/common_helpers';
import { EditHeader, FormSection } from '../common/EditModalComponents';
import CaptureEventForm from '../events/CaptureEventForm';
import { createEvent } from '../events/EventComponents';
import MortalityEventForm from '../events/MortalityEventForm';
import { Modal } from 'components/common';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CritterStrings } from 'constants/strings';

/**
 * the main animal form
 */
export default function EditCritter(
  props: EditorProps<Critter | AttachedCritter> & {
    queryStatus?: QueryStatus;
    busySaving?: boolean;
    onSave: (c: Record<string, unknown>) => Promise<void>;
  }
): JSX.Element {
  const { isCreatingNew, editing, onSave, busySaving, queryStatus } = props;
  //const api = useTelemetryApi();

  editing.permission_type = eCritterPermission.admin;
  //const { markingIncompatibility, removeMarkingsPlease } = CritterStrings;
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  const { identifierFields } = critterFormFields;
  const [cbSelectStatus, setCbSelectStatus] = useState({});
  const [allowSave, setAllowSave] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     //const data = await api.critterbaseApi.bulkUpdate();
  //     const data = await api.update(`/cb/bulk`, { test: 'hello' });
  //     console.log(data);
  //   };
  //   fetchData();
  // }, []);
  //const [markingState, setMarkingState] = useState<(IMarking & { _delete?: boolean })[]>(editing.markings);
  //const [taxonErrorModalOpen, setTaxonErrorModalOpen] = useState(false);

  const critterbaseSave = async (payload) => {
    const { body } = payload;
    //console.log(`Here is editingObj: ${JSON.stringify(editing, null, 2)}`)
    //console.log('Received this body: ' + JSON.stringify(body, null, 2));
    const new_critter = {
      critter_id: body.critter_id,
      animal_id: body.animal_id,
      sex: body.sex,
      wlh_id: body.wlh_id,
      itis_tsn: body.itis_tsn
    };
    const old_critter = {
      critter_id: editing.critter_id,
      animal_id: editing.animal_id,
      sex: editing.sex,
      wlh_id: editing.wlh_id,
      itis_tsn: editing.itis_tsn
    };
    const finalPayload = {
      critters: [],
      captures: [],
      mortalities: [],
      markings: [],
      collections: []
    };
    if (hasChangedProperties(old_critter, new_critter)) {
      finalPayload.critters.push(new_critter);
    }
    if (body.capture.length) {
      const capture = body.capture[0];
      const og_capture = editing.captures[0];
      const captureId = editing.captures[0]?.capture_id;
      if (captureId) {
        capture.capture_id = captureId;
      }
      if (capture.release_location) {
        if (
          og_capture.capture_location_id === og_capture.release_location_id &&
          hasChangedProperties(capture.capture_location, capture.release_location)
        ) {
          /*const clone = Object.assign({}, og_capture.capture_location);
          capture.release_location = Object.assign(clone, capture.release_location);*/
          capture.force_create_release = true;
        }
      }

      const omitted = omitNull({
        ...capture,
        capture_location: capture.capture_location ? omitNull(capture.capture_location) : null,
        release_location: capture.release_location ? omitNull(capture.release_location) : null
      });
      if (hasChangedProperties(og_capture, omitted)) {
        omitted.critter_id = body.critter_id;
        finalPayload.captures.push(omitted);
      }
    }

    if (body.mortality.length && editing.mortality.length) {
      const mortality = body.mortality[0];
      const mortalityId = editing.mortality[0]?.mortality_id;
      if (mortalityId) {
        mortality.mortality_id = mortalityId;
      }
      if (mortality.location) {
        mortality.location = omitNull(mortality.location);
      }

      const omitted = omitNull(mortality);
      if (hasChangedProperties(editing.mortality[0], omitted)) {
        omitted.critter_id = body.critter_id;
        finalPayload.mortalities.push(omitted);
      }
    }

    if (body.marking.length) {
      for (const m of body.marking) {
        const existing = editing.markings.find((a) => a.marking_id === m.marking_id);
        const omitted = omitNull(m);
        if (existing && !hasChangedProperties(existing, omitted) && !m._delete) {
          continue;
        }
        finalPayload.markings.push({ ...m, critter_id: new_critter.critter_id });
      }
    }

    if (body.collection_units) {
      for (const c of body.collection_units) {
        if (old_critter.itis_tsn !== new_critter.itis_tsn && c.critter_collection_unit_id) {
          c._delete = true;
        }
        const existing = editing.collection_units.find(
          (a) => a.critter_collection_unit_id === c.critter_collection_unit_id
        );
        const omitted = omitNull(c);
        if (existing && !hasChangedProperties(existing, omitted) && !c._delete) {
          continue;
        }
        finalPayload.collections.push({ ...c, critter_id: new_critter.critter_id });
      }
    }

    const r = await onSave(finalPayload);
    return r;
  };

  const handleRoute = (v: QueryStatus, key: ICbRouteKey): void => {
    const dict = { ...cbSelectStatus };
    const isLoading = v === 'loading';
    dict[key] = isLoading;
    const s = Object.values(dict).every((a) => !a);
    setCbSelectStatus(dict);
    setAllowSave(s);
  };

  // const formatMarking = (marking_id: string): JSX.Element => {
  //   if (editing.markings) {
  //     const mark = editing.markings.find((a) => a.marking_id === marking_id);
  //     const englishNames: (keyof IMarking)[] = [
  //       'marking_type',
  //       'marking_material',
  //       'body_location',
  //       'primary_colour',
  //       'secondary_colour',
  //       'identifier'
  //     ];
  //     if (mark) {
  //       return (
  //         <>
  //           <li>
  //             Marking UUID: {mark.marking_id}
  //             <ul>
  //               <>{englishNames.map((a) => (mark[a] ? <li>{`${columnToHeader(a)}: ${mark[a]}`}</li> : null))}</>
  //             </ul>
  //           </li>
  //         </>
  //       );
  //     }
  //   }
  //   return null;
  // };

  const Header = (
    <EditHeader<AttachedCritter>
      title={
        <Grid container flexDirection='row' pl={0}>
          <Grid item>WLH ID: {editing?.wlh_id ?? '-'}</Grid>
          {editing.animal_id && <Grid item>&nbsp;/ Animal ID: {editing.animal_id}</Grid>}
        </Grid>
      }
      headers={['itis_scientific_name', 'device_id', 'critter_id', 'permission_type']}
      format={editing.formatPropAsHeader}
      obj={editing as AttachedCritter}
    />
  );

  return (
    <EditModal
      disableHistory={true}
      headerComponent={Header}
      hideSave={!canEdit || queryStatus === 'loading' || !allowSave}
      busySaving={busySaving}
      {...props}
      editing={editing}
      onSave={critterbaseSave}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: InboundObj): void => {
            // const [key, value] = parseFormChangeResult<AttachedCritter>(v);
            // if (key === 'itis_tsn') {
            //   //setTsn(value as number);
            // } else if (key === 'markings') {
            //   //setMarkingState(value as IMarking[]);
            // }
            handlerFromContext(v);
          };
          return (
            <Box>
              <FormSection id='critter' header='Critter Details' size='large'>
                <Divider />
                <FormSection id='identifiers' header='Identifiers'>
                  {identifierFields.map((f) => CreateFormField(editing, f, onChange))}
                  <CbCollectionUnitInputs
                    collection_units={editing.collection_units}
                    tsn={editing.itis_tsn}
                    handleChange={onChange}
                  />
                </FormSection>
                <CbMarkings
                  handleMarkings={(m, err) => {
                    onChange({ marking: m, error: err });
                  }}
                  tsn={editing.itis_tsn}
                  markings={editing.markings}
                />
              </FormSection>
              <FormSection
                id='c-deets'
                header='Latest Capture & Release Details'
                hide={!editing.latestCapture}
                size='large'>
                <Divider />
                <CaptureEventForm
                  event={editing.latestCapture ?? (createEvent(editing, 'capture') as CaptureEvent2)}
                  handleRoute={handleRoute}
                  handleFormChange={onChange}
                  isEditing
                />
              </FormSection>
              <FormSection id='m-deets' header='Mortality Details' hide={!editing.latestMortality} size='large'>
                <Divider />
                <MortalityEventForm
                  event={editing.latestMortality ?? (createEvent(editing, 'mortality') as MortalityEvent)}
                  handleRoute={handleRoute}
                  handleFormChange={onChange}
                  isEditing
                />
                {/* <Divider /> */}
              </FormSection>
            </Box>
          );
        }}
      </ChangeContext.Consumer>
      {/*<Modal
        open={isSuccess && data.verified === false && taxonErrorModalOpen}
        handleClose={() => {
          setTaxonErrorModalOpen(false);
        }}>
        <Typography>{markingIncompatibility}</Typography>
        <Typography>{removeMarkingsPlease}</Typography>
        <ul>{data?.invalid_markings.map((a) => formatMarking(a))}</ul>
      </Modal>*/}
    </EditModal>
  );
}
