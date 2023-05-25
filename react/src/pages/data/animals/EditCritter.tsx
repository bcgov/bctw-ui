import { Box, Container, Divider, Grid } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import ChangeContext from 'contexts/InputChangeContext';
import { useTaxon } from 'contexts/TaxonContext';
import EditModal from 'pages/data/common/EditModal';
import { AttachedCritter, Critter, ICapture, IMortality, IMarking, critterFormFields, markingFormFields } from 'types/animal';
import { InboundObj } from 'types/form_types';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import { EditHeader, FormSection } from '../common/EditModalComponents';
import CaptureEventForm from '../events/CaptureEventForm';
import MortalityEventForm from '../events/MortalityEventForm';
import { createEvent } from '../events/EventComponents';
import { CaptureEvent2 } from 'types/events/capture_event';
import MortalityEvent from 'types/events/mortality_event';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { hasChangedProperties, omitNull } from 'utils/common_helpers';
import { QueryStatus } from 'react-query';
import { ICbRouteKey } from 'critterbase/types';
import { CbMarkings } from 'critterbase/components/CbMarkingInputs';

/**
 * the main animal form
 */
export default function EditCritter(props: EditorProps<Critter | AttachedCritter> & 
  {queryStatus?: QueryStatus, busySaving?: boolean, onSave: (c: any) => Promise<void> }): JSX.Element {
  const { isCreatingNew, editing, open, onSave, busySaving, queryStatus } = props;
  editing.permission_type = eCritterPermission.admin;
  //TODO integration add this back
  //const updateTaxon = useUpdateTaxon();
  const taxon = useTaxon();
  const api = useTelemetryApi();

  /*const { mutateAsync: handleSave, isLoading } = api.useBulkUpdateCritterbaseCritter({});*/

  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  //const canEditCollectiveUnit = !!(canEdit && !editing.collective_unit);
  const isAttached = editing instanceof AttachedCritter;
  const [cbSelectStatus, setCbSelectStatus] = useState({});
  const [allowSave, setAllowSave] = useState(false);
  // const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  // const [workflow, setWorkflow] = useState<WorkflowType>();
  // const [showWorkflow, setShowWorkflow] = useState(false);
  // const [showUDFModal, setShowUDFModal] = useState(false);
  // const [hasBabies, setHasBabies] = useState(false);

  // useDidMountEffect(() => {
  //   if (open) {
  //     reset();
  //   }
  // }, [open]);

  // const reset = (): void => {
  //   setHasBabies(false);
  //   //updateTaxon(null);
  // };
  const critterbaseSave = async (payload) => {
      const { body } = payload;
      const new_critter = { 
        critter_id: body.critter_id,
        animal_id: body.animal_id,
        sex: body.sex,
        wlh_id: body.wlh_id,
        taxon_id: body.taxon_id
      }
      const old_critter = {
        editing: editing.critter_id,
        animal_id: editing.animal_id,
        sex: editing.sex,
        wlh_id: editing.wlh_id,
        taxon_id: editing.taxon_id
      }
      const finalPayload = {
        critters: [
        ],
        captures: [],
        mortalities: [],
        markings: []
      }
      if(hasChangedProperties(old_critter, new_critter)){
        finalPayload.critters.push(new_critter);
      }
      if(body.capture.length) {
        const capture = body.capture[0];
        const og_capture = editing.capture[0];
        const captureId = editing.capture[0]?.capture_id;
        if(captureId) {
          capture.capture_id = captureId;
        }
        if(capture.capture_location) {
          capture.capture_location = omitNull(capture.capture_location);
        }
        if(capture.release_location) {
          if(capture.capture_location_id === capture.release_location_id) {
            const clone = Object.assign({}, og_capture.capture_location);
            capture.release_location = Object.assign(clone, capture.release_location);
            capture.force_create_release = true;
          }
          capture.release_location = omitNull(capture.release_location);
        }
        capture.critter_id = body.critter_id;
        const omitted = omitNull(capture);
        if(hasChangedProperties(og_capture, omitted)) {
          finalPayload.captures.push(omitNull(capture));
        }
      }
  
      if(body.mortality.length && editing.mortality.length) {
        const mortality = body.mortality[0];
        const mortalityId = editing.mortality[0]?.mortality_id;
        if(mortalityId) {
          mortality.mortality_id = mortalityId;
        }
        if(mortality.location) {
          mortality.location = omitNull(mortality.location);
        }
        mortality.critter_id = body.critter_id;
        const omitted = omitNull(mortality);
        if(hasChangedProperties(editing.mortality[0], omitted)) {
          finalPayload.mortalities.push(omitted);
        }
      }

      if(body.marking.length) {
        for (const m of body.marking) {
          m.critter_id = body.critter_id;
          const existing = editing.marking.find(a => a.marking_id = m.marking_id);
          const omitted = omitNull(m);
          if(existing && !hasChangedProperties(existing, omitted)) {
            continue;
          }
          finalPayload.markings.push(m);
        }
        /*finalPayload.markings = body.marking.map(m => {
          m.critter_id = body.critter_id;
          return omitNull(m)
        });*/
      }

      const r = await onSave(finalPayload);
      return r;
  }

  const { captureFields, characteristicsFields, identifierFields, releaseFields } = critterFormFields;

  const handleRoute = (v: QueryStatus, key: ICbRouteKey): void => {
    const dict = {...cbSelectStatus};
    const isLoading = v === 'loading';
    dict[key] = isLoading;
    const s = Object.values(dict).every(a => !a);
    setCbSelectStatus(dict);
    setAllowSave(s);
    //console.log(`In Editcritter handleRoute: ${JSON.stringify(dict)} ${s}`)
  }

  const Header = (
    <Container maxWidth='xl'>
      {isCreatingNew ? (
        <Box pt={3}>
          <Box component='h1' mt={0} mb={0}>
            Add Critter
          </Box>
        </Box>
      ) : (
        <EditHeader<AttachedCritter>
          title={
            <Grid container flexDirection='row'>
              <Grid item>WLH ID: {editing?.wlh_id ?? '-'}</Grid>
              {editing.animal_id && <Grid item>&nbsp;/ Animal ID: {editing.animal_id}</Grid>}
            </Grid>
          }
          headers={['taxon', 'device_id', 'critter_id', 'permission_type']}
          format={editing.formatPropAsHeader}
          obj={editing as AttachedCritter}
        />
      )}
    </Container>
  );

  return (
    <EditModal disableHistory={true} headerComponent={Header} hideSave={!canEdit || queryStatus === 'loading' || !allowSave}  busySaving={busySaving} {...props} editing={editing} onSave={critterbaseSave}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: InboundObj): void => {
           handlerFromContext(v);
          };
          return (
            <Box>
              <FormSection id='critter' header='Critter Details' size='large'>
                <Divider />
                <FormSection id='identifiers' header='Identifiers'>
                  {identifierFields?.map((f) => CreateFormField(editing, f, onChange, {}, false, {}, handleRoute))}
                </FormSection>
                <FormSection id='characteristics' header='Characteristics'>
                  {characteristicsFields?.map((f) => CreateFormField(editing, f, onChange, {}, false, {}, handleRoute))}
                </FormSection>
                <CbMarkings
                  handleMarkings={(m, err) => {
                    onChange({ marking: m, error: err });
                  }}
                  taxon_id={editing.taxon_id}
                  markings={editing.marking}
                />
              </FormSection>
              <FormSection
                id='c-deets'
                header='Latest Capture & Release Details'
                hide={!editing.latestCapture}
                size='large'>
                <Divider />
                <CaptureEventForm event={editing.latestCapture ?? createEvent(editing, 'capture') as CaptureEvent2} handleRoute={handleRoute} handleFormChange={onChange} isEditing />
              </FormSection>
              <FormSection id='m-deets' header='Mortality Details' hide={!editing.latestMortality} size='large'>
                <Divider /> 
                <MortalityEventForm event={editing.latestMortality ?? createEvent(editing, 'mortality') as MortalityEvent} handleRoute={handleRoute} handleFormChange={onChange} isEditing/>
                {/* <Divider /> */}
              </FormSection>
            </Box>
          );
        }}
      </ChangeContext.Consumer>
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
