import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { Animal, AttachedAnimal, critterFormFields } from 'types/animal';
import { Box, Container, IconButton } from '@mui/material';
import { EditorProps } from 'components/component_interfaces';
import { CreateSpeciesFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, EditHeader, FormSection } from '../common/EditModalComponents';
import { WorkflowType, wfFields } from 'types/events/event';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { Button, Icon } from 'components/common';
import { eUDFType, IUDF } from 'types/udf';
import AddUDF from 'pages/udf/AddUDF';
import SelectUDF from 'components/form/SelectUDF';
import { MapStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useSpecies, useUpdateSpecies } from 'contexts/SpeciesContext';
import { hideSection } from 'utils/species';
import { SpeciesSelect } from 'components/form/SpeciesSelect';
import { CritterWorkflow } from '../events/CritterWorkflow';

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
  const [workflow, setWorkflow] = useState<WorkflowType>();
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showUDFModal, setShowUDFModal] = useState(false);
  const [hasBabies, setHasBabies] = useState(false);

  useDidMountEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const reset = (): void => {
    setHasBabies(false);
    updateSpecies(null);
  };

  const {
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
  const handleWorkflow = (wf: WorkflowType) => {
    setWorkflow(wf);
    setShowWorkflow(true);
  };
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
                <SpeciesSelect handleChange={onChange} value={editing.species} useLock={!isCreatingNew} useModal />
              </FormSection>
              <FormSection
                id='cr-ids'
                header='Identifiers'
                disabled={!canEdit}
                hide={hideSection([...identifierFields2, ...identifierFields2], species)}>
                {[
                  ...identifierFields1.map((f, i) => (
                    <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                  )),
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
                  ...identifierFields2.map((f, i) => (
                    <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                  ))
                ]}
              </FormSection>
              <FormSection
                id='cr-chars'
                header='Characteristics'
                disabled={!canEdit}
                hide={hideSection(characteristicsFields, species)}>
                {characteristicsFields.map((f, i) => (
                  <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                ))}
                <CreateSpeciesFormField
                  obj={editing}
                  formField={wfFields.get('juvenile_at_heel')}
                  handleChange={onChange}
                />
                <CreateSpeciesFormField
                  obj={editing}
                  formField={wfFields.get('juvenile_at_heel_count')}
                  handleChange={onChange}
                  inputProps={{ required: hasBabies, disabled: !hasBabies || !canEdit }}
                />
              </FormSection>
              <FormSection
                id='cr-asoc'
                header='Association With Another Individual'
                disabled={!canEdit}
                hide={hideSection(associatedAnimalFields, species)}>
                {associatedAnimalFields.map((f, i) => (
                  <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                ))}
              </FormSection>
              {/* {associatedAnimalFields.map((f) => displaySpeciesFormFields(f, 'caribou' as eSpecies) && CreateFormField(editing, f, onChange))} */}
              <FormSection
                id='cr-comm'
                header='Comments About This Animal'
                disabled={!canEdit}
                hide={hideSection(animalCommentField, species)}>
                {animalCommentField.map((f, i) => (
                  <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                ))}
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
                        onClick={(): void => handleWorkflow('capture')}>
                        Add Capture Event
                      </Button>
                    }>
                    {captureFields.map((f, i) => (
                      <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                    ))}
                  </FormSection>
                  <FormSection
                    id='cr-rel'
                    header='Latest Release Details'
                    disabled={true}
                    btn={
                      <Button
                        disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleWorkflow('release')}>
                        Add Release Event
                      </Button>
                    }>
                    {releaseFields.map((f, i) => (
                      <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                    ))}
                  </FormSection>

                  <FormSection
                    id='cr-mort'
                    header='Mortality Details'
                    disabled={true}
                    btn={
                      <Button
                        disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleWorkflow('mortality')}>
                        Record Mortality Details
                      </Button>
                    }>
                    {mortalityFields.map((f, i) => (
                      <CreateSpeciesFormField obj={editing} key={i} formField={f} handleChange={onChange} />
                    ))}
                  </FormSection>

                  {/* hide device assignment history for new critters */}
                  <AssignmentHistory
                    open={showAssignmentHistory}
                    handleClose={(): void => setShowAssignmentHistory(false)}
                    critter_id={editing.critter_id}
                    permission_type={editing.permission_type}
                  />
                  <CritterWorkflow
                    editing={editing}
                    workflow={workflow}
                    open={showWorkflow}
                    setOpen={setShowWorkflow}
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
