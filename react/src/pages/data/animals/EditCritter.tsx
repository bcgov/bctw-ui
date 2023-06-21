import { Box, Divider, Grid, Typography } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import ChangeContext from 'contexts/InputChangeContext';
import { CbCollectionUnitInputs } from 'critterbase/components/CbCollectionUnitInputs';
import { CbMarkings } from 'critterbase/components/CbMarkingInputs';
import { ICbRouteKey } from 'critterbase/types';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
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
import { CbSelect } from 'critterbase/components/CbSelect';
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
  editing.permission_type = eCritterPermission.admin;
  const { markingIncompatibility, removeMarkingsPlease } = CritterStrings;
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  const { identifierFields } = critterFormFields;
  const [cbSelectStatus, setCbSelectStatus] = useState({});
  const [allowSave, setAllowSave] = useState(false);
  const [taxonId, setTaxonId] = useState(editing.taxon_id);
  const [markingState, setMarkingState] = useState<(IMarking & {_delete?: boolean})[]>(editing.marking);
  const [taxonErrorModalOpen, setTaxonErrorModalOpen] = useState(false);

  const critterbaseSave = async (payload) => {
    const { body } = payload;
    //console.log(`Here is editingObj: ${JSON.stringify(editing, null, 2)}`)
    //console.log('Received this body: ' + JSON.stringify(body, null, 2));
    const new_critter = {
      critter_id: body.critter_id,
      animal_id: body.animal_id,
      sex: body.sex,
      wlh_id: body.wlh_id,
      taxon_id: body.taxon_id
    };
    const old_critter = {
      editing: editing.critter_id,
      animal_id: editing.animal_id,
      sex: editing.sex,
      wlh_id: editing.wlh_id,
      taxon_id: editing.taxon_id
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
      const og_capture = editing.capture[0];
      const captureId = editing.capture[0]?.capture_id;
      if (captureId) {
        capture.capture_id = captureId;
      }
      if (capture.capture_location) {
        capture.capture_location = omitNull(capture.capture_location);
      }
      if (capture.release_location) {
        if (capture.capture_location_id === capture.release_location_id) {
          const clone = Object.assign({}, og_capture.capture_location);
          capture.release_location = Object.assign(clone, capture.release_location);
          capture.force_create_release = true;
        }
        capture.release_location = omitNull(capture.release_location);
      }
      capture.critter_id = body.critter_id;
      const omitted = omitNull(capture);
      if (hasChangedProperties(og_capture, omitted)) {
        finalPayload.captures.push(omitNull(capture));
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
      mortality.critter_id = body.critter_id;
      const omitted = omitNull(mortality);
      if (hasChangedProperties(editing.mortality[0], omitted)) {
        finalPayload.mortalities.push(omitted);
      }
    }

    if (body.marking.length) {

      for (const m of body.marking) {
        m.critter_id = body.critter_id;
        const existing = editing.marking.find((a) => (a.marking_id === m.marking_id));
        const omitted = omitNull(m);
        if (existing && !hasChangedProperties(existing, omitted) && !m._delete) {
          continue;
        }
        finalPayload.markings.push(m);
      }
    }

    if(body.collection_units) {
        for(const c of body.collection_units) {
          c.critter_id = new_critter.critter_id;
          if(old_critter.taxon_id !== new_critter.taxon_id && c.critter_collection_unit_id) {
            c._delete = true;
          }
          
          const existing = editing.collection_units.find((a) => a.critter_collection_unit_id === c.critter_collection_unit_id);
          const omitted = omitNull(c);
          if(existing && !hasChangedProperties(existing, omitted) && !c._delete) {
            continue;
          }
          finalPayload.collections.push(c);
        }
        
    }
    
    //console.log(`Here is the final payload ${JSON.stringify(finalPayload, null, 2)}`)
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
    //console.log(`In Editcritter handleRoute: ${JSON.stringify(dict)} ${s}`)
  };

  const api = useTelemetryApi();
  const { isSuccess, data, mutateAsync } = api.useVerifyMarkingsAgainstTaxon({});

  const checkIfTaxonChangeAllowed = async (new_taxon: string): Promise<boolean> => {
    if(!new_taxon) {
      return true;
    }
    const result = await mutateAsync({taxon_id: new_taxon, markings: markingState.filter(a => !a._delete)});
    if(result.verified) {
      return true;
    }
    else {
      setTaxonErrorModalOpen(true);
      return false;
    }
  }

  const formatMarking = (marking_id: string): JSX.Element => {
    if(editing.marking) {
      const mark = editing.marking.find(a => a.marking_id === marking_id);
      const englishNames:  (keyof IMarking)[] = ['marking_type', 'marking_material', 'body_location', 'primary_colour', 'secondary_colour', 'identifier']
      if(mark) {
        return (<>
          <li>Marking UUID: {mark.marking_id}
            <ul>
            <>
              {
                englishNames.map(a => mark[a] ? <li>{`${columnToHeader(a)}: ${mark[a]}`}</li> : null)
              }
              </>
            </ul>
          </li>
        </>)
      }
    }
    return null;
  }

  const Header = (
    <EditHeader<AttachedCritter>
      title={
        <Grid container flexDirection='row' pl={0}>
          <Grid item>WLH ID: {editing?.wlh_id ?? '-'}</Grid>
          {editing.animal_id && <Grid item>&nbsp;/ Animal ID: {editing.animal_id}</Grid>}
        </Grid>
      }
      headers={['taxon', 'device_id', 'critter_id', 'permission_type']}
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
            const [key, value] = parseFormChangeResult<AttachedCritter>(v);
            if (key === 'taxon_id') {
              setTaxonId(value as string);
            }
            else if(key === 'marking') {
              setMarkingState(value as IMarking[]);
            }
            handlerFromContext(v);
          };
          return (
            <Box>
              <FormSection id='critter' header='Critter Details' size='large'>
                <Divider />
                <FormSection id='identifiers' header='Identifiers'>
                  <CbSelect
                    value={editing.taxon_id} 
                    prop={'taxon'} 
                    handleChange={onChange} 
                    isSelectionAllowed={checkIfTaxonChangeAllowed}
                    cbRouteKey={'species'} 
                    query={''}
                    {...(identifierFields.find(a => a.prop === 'taxon_id'))}
                    />
                  {identifierFields?.filter(a => a.prop !== 'taxon_id').map((f) => CreateFormField(editing, f, onChange))}
                  <CbCollectionUnitInputs
                    collection_units={editing.collection_units}
                    taxon_id={taxonId}
                    handleChange={onChange}
                  />
                </FormSection>
                <CbMarkings
                  handleMarkings={(m, err) => {
                    onChange({ marking: m, error: err });
                  }}
                  taxon_id={taxonId}
                  markings={editing.marking}
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
      <Modal 
        open={isSuccess && data.verified === false && taxonErrorModalOpen} 
        handleClose={() => {setTaxonErrorModalOpen(false)}}
      >
        <Typography>{markingIncompatibility}</Typography>
        <Typography>{removeMarkingsPlease}</Typography>
        <ul>
        {
          data?.invalid_markings.map(a => formatMarking(a))
        }
        </ul>
      </Modal>
    </EditModal>
  );
}

{
  /* <FormSection id='characteristics' header='Critter Characteristics' disabled={true}>
<div>placeholder for critter details</div>

</FormSection>
<FormSection id='capture-details' header='Latest Capture Details' disabled={true}>
<div>placeholder for critter details</div>

</FormSection>
<FormSection id='Mortality-details' header='Mortality Details' disabled={true}>
<div>placeholder for critter details</div>
{characteristicsFields.map((f, i) => (
  <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
))}
</FormSection> */
}

// {/* <ChangeContext.Consumer>
//   {(handlerFromContext): JSX.Element => {
//     // override the modal's onChange function
//     const onChange = (v: InboundObj): void => {
//       const [key, value] = parseFormChangeResult<Critter>(v);
//       if (key === 'juvenile_at_heel' && value) {
//         setHasBabies(String(value).toLowerCase() === 'y');
//       }
//       handlerFromContext(v);
//     };
//     return (
//       <>
//         <AddUDF
//           title='Manage Collective Units'
//           hideDelete={true}
//           hideEdit={true}
//           hideDuplicate={true}
//           udf_type={eUDFType.collective_unit}
//           open={showUDFModal}
//           handleClose={(): void => setShowUDFModal(false)}
//           afterSave={(): void => setShowUDFModal(false)}
//         />
//         render the collective unit (CU) select. disabled if a CU has already been assigned CU editor is available if
//         user has permission
//         <FormSection id='cr-taxon' header='Taxon' disabled={!canEdit}>
//           <TaxonSelect handleChange={onChange} value={editing.taxon} useLock={!isCreatingNew} useModal />
//         </FormSection>
//         <FormSection
//           id='cr-ids'
//           header='Identifiers'
//           disabled={!canEdit}
//           hide={hideSection([...identifierFields2, ...identifierFields2], taxon)}>
//           {[
//             ...identifierFields1.map((f, i) => (
//               <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//             )),
//             <Box display='inline' key='udf-cu'>
//               <SelectUDF
//                 style={{ width: '200px' }}
//                 multiple={false}
//                 defaultValue={editing.collective_unit}
//                 udfType={eUDFType.collective_unit}
//                 label={MapStrings.collectiveUnitLabel}
//                 changeHandler={(v: IUDF): void => onChange({ [eUDFType.collective_unit]: v.value })}
//                 disabled={!canEditCollectiveUnit}
//               />
//               {canEditCollectiveUnit ? (
//                 <IconButton key='udf-icon' onClick={(): void => setShowUDFModal((o) => !o)}>
//                   <Icon icon='edit' />
//                 </IconButton>
//               ) : null}
//             </Box>,
//             //FIXME
//             ...identifierFields2.map((f, i) => (
//               <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//             ))
//           ]}
//         </FormSection>
//         <FormSection
//           id='cr-chars'
//           header='Characteristics'
//           disabled={!canEdit}
//           hide={hideSection(characteristicsFields, taxon)}>
//           {characteristicsFields.map((f, i) => (
//             <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//           ))}
//           <CreateTaxonFormField obj={editing} formField={wfFields.get('juvenile_at_heel')} handleChange={onChange} />
//           <CreateTaxonFormField
//             obj={editing}
//             formField={wfFields.get('juvenile_at_heel_count')}
//             handleChange={onChange}
//             inputProps={{ required: hasBabies, disabled: !hasBabies || !canEdit }}
//           />
//         </FormSection>
//         <FormSection
//           id='cr-asoc'
//           header='Association With Another Individual'
//           disabled={!canEdit}
//           hide={hideSection(associatedAnimalFields, taxon)}>
//           {associatedAnimalFields.map((f, i) => (
//             <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//           ))}
//         </FormSection>
//         {/* {associatedAnimalFields.map((f) => displaytaxonFormFields(f, 'caribou' as etaxon) && CreateFormField(editing, f, onChange))} */}
//         <FormSection
//           id='cr-comm'
//           header='Comments About This Critter'
//           disabled={!canEdit}
//           hide={hideSection(animalCommentField, taxon)}>
//           {animalCommentField.map((f, i) => (
//             <CreateTaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//           ))}
//         </FormSection>
//         {/* hide all workflow related fields when creating a new animal */}
//         {!isCreatingNew ? (
//           <>
//             {/*
//                   //TODO integration potentially add this back or move to row actions
//                   <FormSection
//                     id='cr-cap'
//                     header='Latest Capture Details'
//                     disabled={true}
//                     btn={
//                       <Button
//                         disabled={!isAttached}
//                         {...editEventBtnProps}
//                         onClick={(): void => handleWorkflow('capture')}>
//                         Add Capture Event
//                       </Button>
//                     }>
//                     {captureFields.map((f, i) => (
//                       <CreatetaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//                     ))}
//                   </FormSection> */}

//             {/* //TODO integration potentially add this back or move to row actions
//                   <FormSection
//                     id='cr-rel'
//                     header='Latest Release Details'
//                     disabled={true}
//                     btn={
//                       <Button
//                         disabled={!isAttached}
//                         {...editEventBtnProps}
//                         onClick={(): void => handleWorkflow('release')}>
//                         Add Release Event
//                       </Button>
//                     }>
//                     {releaseFields.map((f, i) => (
//                       <CreatetaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//                     ))}
//                   </FormSection> */}

//             {/*
//                   //TODO integration potentially add this back or move to row actions
//                   <FormSection
//                     id='cr-mort'
//                     header='Mortality Details'
//                     disabled={true}
//                     btn={
//                       <Button
//                         disabled={!isAttached}
//                         {...editEventBtnProps}
//                         onClick={(): void => handleWorkflow('mortality')}>
//                         Record Mortality Details
//                       </Button>
//                     }>
//                     {mortalityFields.map((f, i) => (
//                       <CreatetaxonFormField obj={editing} key={i} formField={f} handleChange={onChange} />
//                     ))}
//                   </FormSection> */}

//             {/* hide device assignment history for new critters */}
//             <AssignmentHistory
//               open={showAssignmentHistory}
//               handleClose={(): void => setShowAssignmentHistory(false)}
//               critter_id={editing.critter_id}
//               permission_type={editing.permission_type}
//             />
//             <CritterWorkflow editing={editing} workflow={workflow} open={showWorkflow} setOpen={setShowWorkflow} />
//           </>
//         ) : null}
//       </>
//     );
//   }}
// </ChangeContext.Consumer>; */}
