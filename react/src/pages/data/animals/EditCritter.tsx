import { Box, Container, Divider, Grid } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import ChangeContext from 'contexts/InputChangeContext';
import { useTaxon } from 'contexts/TaxonContext';
import EditModal from 'pages/data/common/EditModal';
import { AttachedCritter, Critter, critterFormFields } from 'types/animal';
import { InboundObj } from 'types/form_types';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import { EditHeader, FormSection } from '../common/EditModalComponents';
import CaptureEventForm from '../events/CaptureEventForm';
import MortalityEventForm from '../events/MortalityEventForm';

/**
 * the main animal form
 */
export default function EditCritter(props: EditorProps<Critter | AttachedCritter>): JSX.Element {
  const { isCreatingNew, editing, open } = props;
  editing.permission_type = eCritterPermission.admin;
  //TODO integration add this back
  //const updateTaxon = useUpdateTaxon();
  const taxon = useTaxon();

  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  //const canEditCollectiveUnit = !!(canEdit && !editing.collective_unit);
  const isAttached = editing instanceof AttachedCritter;
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

  const { captureFields, characteristicsFields, identifierFields, releaseFields } = critterFormFields;

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
    <EditModal headerComponent={Header} hideSave={!canEdit} {...props} editing={editing}>
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
                  {identifierFields?.map((f) => CreateFormField(editing, f, onChange))}
                </FormSection>
                <FormSection id='characteristics' header='Characteristics'>
                  {characteristicsFields?.map((f) => CreateFormField(editing, f, onChange))}
                </FormSection>
              </FormSection>
              <FormSection
                id='c-deets'
                header='Latest Capture & Release Details'
                hide={!editing.latestCapture}
                size='large'>
                <Divider />
                <CaptureEventForm event={editing.latestCapture} handleFormChange={onChange} isEditing />
              </FormSection>
              <FormSection id='m-deets' header='Latest Mortality Details' hide={!editing.latestMortality} size='large'>
                <Divider />
                <MortalityEventForm event={editing.latestMortality} handleFormChange={onChange} />
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
