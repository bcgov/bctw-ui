import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { Animal, AttachedAnimal, critterFormFields, eSpecies } from 'types/animal';
import { Box, Container, IconButton } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateSpeciesFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useEffect, useState } from 'react';
import { editEventBtnProps, EditHeader, FormSection } from '../common/EditModalComponents';
import { editObjectToEvent, IBCTWWorkflow, WorkflowType, wfFields } from 'types/events/event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import MortalityEvent from 'types/events/mortality_event';
import CaptureEvent from 'types/events/capture_event';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import ReleaseEvent from 'types/events/release_event';
import { Button, Icon, Tooltip } from 'components/common';
import { eUDFType, IUDF } from 'types/udf';
import AddUDF from 'pages/udf/AddUDF';
import SelectUDF from 'components/form/SelectUDF';
import { CritterStrings, MapStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useSpecies, useUISpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import { hideSection } from 'utils/species';
import { SpeciesSelect } from 'components/form/SpeciesSelect';

/**
 * the main animal form
 */
export default function EditCritter(props: EditorProps<Animal | AttachedAnimal>): JSX.Element {
  const { isCreatingNew, editing, open } = props;
  const updateSpecies = useUpdateSpecies();
  const species = useSpecies();

  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  const canEditCollectiveUnit = !!(canEdit && !editing.collective_unit);
  const isAttached = editing instanceof AttachedAnimal;
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState<CaptureEvent | ReleaseEvent | MortalityEvent>(new MortalityEvent());
  const [showUDFModal, setShowUDFModal] = useState(false);
  const [hasBabies, setHasBabies] = useState(false);

  useDidMountEffect(() => {
    if(open) {
      reset();
    }
  }, [open]);

  const reset = (): void => {
    setHasBabies(false);
    updateSpecies(null);
  }
  // useEffect(() => {
  //   setLockSpecies(!isCreatingNew)
  // },[isCreatingNew, species])
  /**
   * when a workflow button is clicked, update the event type
   * binding all properties of the @var editing to the event
   */
  const createEvent = (wfType: WorkflowType): CaptureEvent | ReleaseEvent | MortalityEvent => {
    if (wfType === 'capture') {
      return editObjectToEvent(editing, new CaptureEvent(), [
        'species',
        'translocation',
        'recapture',
        'region',
        'population_unit'
      ]);
    } else if (wfType === 'release') {
      return editObjectToEvent(editing, new ReleaseEvent(), ['region', 'population_unit']);
    } else if (wfType === 'mortality') {
      return editObjectToEvent(editing, new MortalityEvent(), ['animal_status']);
    }
  };

  /**
   * if a workflow button is clicked and the event type is the same, open or close the workflow modal.
   * otherwise, update the workflow type which will trigger the modal state
   */
  const handleOpenWorkflow = (e: WorkflowType): void => {
    updateEvent(createEvent(e));
    setShowWorkflowForm((o) => !o);
  };

  /**
   * when a capture workflow is saved, always show the release workflow unless a translocation is underway
   * todo: is this still needed?
   */
  const handleWorkflowSaved = async (e: IBCTWWorkflow): Promise<void> => {
    await setShowWorkflowForm(false);
    if (e.event_type === 'capture' && e instanceof CaptureEvent) {
      if (e.translocation && !e.isTranslocationComplete) {
        // do nothing
      } else {
        // show the release form, populating the location and date fields
        const rwf = editObjectToEvent(e, new ReleaseEvent(e), ['region', 'population_unit']);
        // set the new event directly, triggering the display of the release form
        // console.log(rwf)
        await updateEvent(rwf as any);
        await setShowWorkflowForm((o) => !o);
      }
    }
  };

  /**
   * the capture workflow has multiple exit points that chain to other workflows
   * this is a separate handler because we do not want to save the form until the
   * @param nextWorkflow is completed
   */
  const handleWorkflowChain = async (e: CaptureEvent, nextWorkflow: WorkflowType): Promise<void> => {
    if (e.event_type !== 'capture') {
      return;
    }
    let newwf;
    if (nextWorkflow === 'mortality') {
      newwf = new MortalityEvent(undefined, e);
    } else if (nextWorkflow === 'release') {
      newwf = new ReleaseEvent(e);
    }
    if (!newwf) {
      return;
    }
    // there are only animal-related fields in capture workflows
    const next = editObjectToEvent(e.getAnimal(), newwf, []);
    //console.log(`capture workflow chained to ${nextWorkflow} type`, next);
    await updateEvent(next);
    await setShowWorkflowForm((o) => !o);
  };
  const {
    testFields,
    speciesField,
    associatedAnimalFields,
    captureFields,
    characteristicsFields,
    identifierFields1,
    identifierFields2,
    mortalityFields,
    releaseFields,
    animalCommentField
  } = critterFormFields;
  const Header = (
    <Container maxWidth='xl'>
      {isCreatingNew ? (
        <Box pt={3}>
          <Box component='h1' mt={0} mb={0}>
            Add Animal
          </Box>
        </Box>
      ) : (
        <EditHeader<AttachedAnimal>
          title={
            <>
              WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{ fontWeight: 100 }}>/</span>&nbsp; Animal ID:{' '}
              {editing?.animal_id ?? '-'}
            </>
          }
          headers={['species', 'device_id', 'critter_id', 'permission_type']}
          format={(editing as AttachedAnimal).formatPropAsHeader}
          obj={editing as AttachedAnimal}
          btn={
            <Button variant='outlined' className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
              Device Assignment
            </Button>
          }
        />
      )}
    </Container>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} {...props} editing={new Animal(editing.critter_id)}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: InboundObj): void => {
            const [key, value] = parseFormChangeResult<Animal>(v);
            if (key === 'juvenile_at_heel' && value) {
              setHasBabies(String(value).toLowerCase() === 'y');
            }
            handlerFromContext(v);
          };
          return (
            <>
              <AddUDF
                title='Manage Collective Units'
                hideDelete={true}
                hideEdit={true}
                hideDuplicate={true}
                udf_type={eUDFType.collective_unit}
                open={showUDFModal}
                handleClose={(): void => setShowUDFModal(false)}
                afterSave={(): void => setShowUDFModal(false)}
                />
              {/* 
                render the collective unit (CU) select.
                disabled if a CU has already been assigned
                CU editor is available if user has permission
              */}
              <FormSection id='cr-species' header='Species' disabled={!canEdit}>
                {/* <CreateSpeciesFormField obj={editing} formField={wfFields.get('species')} handleChange={onChange} inputProps={{disabled: lockSpecies}}/> */}
                <SpeciesSelect handleChange={onChange} value={editing.species} useLock={!isCreatingNew} useModal/>
              </FormSection>
              <FormSection id='cr-ids' header='Identifiers' disabled={!canEdit} hide={hideSection([...identifierFields2, ...identifierFields2], species)}>
                {[
                  ...identifierFields1.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>),
                  <Box display='inline' key='udf-cu'>
                    <SelectUDF
                      style={{ width: '200px' }}
                      multiple={false}
                      defaultValue={editing.collective_unit}
                      udfType={eUDFType.collective_unit}
                      label={MapStrings.collectiveUnitLabel}
                      changeHandler={(v: IUDF): void => onChange({ [eUDFType.collective_unit]: v.value })}
                      disabled={!canEditCollectiveUnit}
                      />
                    {canEditCollectiveUnit ? (
                      <IconButton key='udf-icon' onClick={(): void => setShowUDFModal((o) => !o)}>
                        <Icon icon='edit' />
                      </IconButton>
                    ) : null}
                  </Box>,
                  //FIXME
                  ...identifierFields2.map(f => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)
                ]}
              </FormSection>
              <FormSection id='cr-chars' header='Characteristics' disabled={!canEdit} hide={hideSection(characteristicsFields, species)}>
                {characteristicsFields.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
                <CreateSpeciesFormField obj={editing} formField={wfFields.get('juvenile_at_heel')} handleChange={onChange}/>
                <CreateSpeciesFormField obj={editing} formField={wfFields.get('juvenile_at_heel_count')} 
                handleChange={onChange} inputProps={{required: hasBabies, disabled: !hasBabies || !canEdit }}/>
              </FormSection>
              <FormSection id='cr-asoc' header='Association With Another Individual' disabled={!canEdit} hide={hideSection(associatedAnimalFields, species)}>
                {associatedAnimalFields.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
              </FormSection>
                {/* {associatedAnimalFields.map((f) => displaySpeciesFormFields(f, 'caribou' as eSpecies) && CreateFormField(editing, f, onChange))} */}
              <FormSection id='cr-comm' header='Comments About This Animal' disabled={!canEdit} hide={hideSection(animalCommentField, species)}>
                {animalCommentField.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
              </FormSection>
              {/* hide all workflow related fields when creating a new animal */}
              {!isCreatingNew ? (
                <>
                  <FormSection
                    id='cr-cap'
                    header='Latest Capture Details'
                    disabled={true}
                    btn={
                      <Button
                        disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleOpenWorkflow('capture')}>
                        Add Capture Event
                      </Button>
                    }>
                    {captureFields.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
                  </FormSection>
                  <FormSection
                    id='cr-rel'
                    header='Latest Release Details'
                    disabled={true}
                    btn={
                      <Button
                      disabled={!isAttached}
                      {...editEventBtnProps}
                      onClick={(): void => handleOpenWorkflow('release')}>
                        Add Release Event
                      </Button>
                    }>
                    {releaseFields.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
                  </FormSection>

                  <FormSection
                    id='cr-mort'
                    header='Mortality Details'
                    disabled={true}
                    btn={
                      <Button
                      disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleOpenWorkflow('mortality')}>
                        Record Mortality Details
                      </Button>
                    }>
                    {mortalityFields.map((f) => <CreateSpeciesFormField obj={editing} formField={f} handleChange={onChange}/>)}
                  </FormSection>

                  {/* hide device assignment history for new critters */}
                  <AssignmentHistory
                    open={showAssignmentHistory}
                    handleClose={(): void => setShowAssignmentHistory(false)}
                    critter_id={editing.critter_id}
                    permission_type={editing.permission_type}
                    />
                  <WorkflowWrapper
                    open={showWorkflowForm}
                    event={event as any}
                    handleClose={(): void => setShowWorkflowForm(false)}
                    onEventSaved={handleWorkflowSaved}
                    onEventChain={handleWorkflowChain}
                    />
                </>
              ) : null}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
