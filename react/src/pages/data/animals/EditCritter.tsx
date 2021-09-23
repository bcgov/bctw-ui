import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { Animal, AttachedAnimal, critterFormFields } from 'types/animal';
import { Box, Container } from '@material-ui/core';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, EditHeader, FormSection } from '../common/EditModalComponents';
import { editObjectToEvent, IBCTWWorkflow, WorkflowType } from 'types/events/event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import useDidMountEffect from 'hooks/useDidMountEffect';
import MortalityEvent from 'types/events/mortality_event';
import CaptureEvent from 'types/events/capture_event';
import { InboundObj, isDisabled } from 'types/form_types';
import ReleaseEvent from 'types/events/release_event';

/**
 * the main animal form
 * bug: cant save?
 */
export default function EditCritter(props: EditorProps<Animal | AttachedAnimal>): JSX.Element {
  const { isCreatingNew, editing } = props;
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  const isAttached = editing instanceof AttachedAnimal;
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  const [workflowType, setWorkflowType] = useState<WorkflowType>('unknown');
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  //fixme: type this
  const [event, updateEvent] = useState(new MortalityEvent());

  /**
   * when a workflow button is clicked, update the event type
   * binding all properties of the @var editing to the event
   */
  useDidMountEffect(async () => {
    updateEvent(() => {
      let e, o;
      if (workflowType === 'capture') {
        e = new CaptureEvent();
        o = editObjectToEvent(Object.assign({}, editing) as Animal, e, ['species', 'translocation', 'recapture']);
      } else if (workflowType === 'release') {
        e = new ReleaseEvent(false);
        o = editObjectToEvent(Object.assign({}, editing) as Animal, e, []);
      } else if (workflowType === 'mortality') {
        e = new MortalityEvent();
        o = editObjectToEvent(Object.assign({}, editing) as AttachedAnimal, e, ['animal_status']);
      }
      return o;
    });
  }, [workflowType]);

  // show the workflow form when a new event object is created
  useDidMountEffect(() => {
    if (event) {
      // console.log('event updated', event.event_type,event);
      setShowWorkflowForm((o) => !o);
    }
  }, [event]);

  /**
   * if a workflow button is clicked and the event type is the same, open or close the workflow modal. 
   * otherwise, update the workflow type which will trigger the modal state
   */
  const handleOpenWorkflow = (e: WorkflowType): void => {
    if (workflowType === e) {
      setShowWorkflowForm((o) => !o);
    } else {
      setWorkflowType(e);
    }
  };

  /**
   * when a capture workflow is saved and translocate is true, show the release form
   */
  const handleEventSaved = async(e: IBCTWWorkflow): Promise<void> => {
    await setShowWorkflowForm(false);
    if (e.event_type === 'capture' && e instanceof CaptureEvent && !!e.translocation) {
      // console.log('capture form completed with translcoation = true, initiate release workflow');
      const rwf = editObjectToEvent(e, new ReleaseEvent(true, e.location_event), ['event_type']);
      // console.log(rwf);
      // set the new event directly, triggering the display of the release form
      await updateEvent(rwf as any);
    }
  }

  const {
    associatedAnimalFields,
    captureFields,
    characteristicsFields,
    identifierFields,
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
              WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{ fontWeight: 100 }}>/</span>&nbsp; Animal ID:{' '} {editing?.animal_id ?? '-'}
            </>
          }
          headers={['species', 'device_id', 'permission_type']}
          format={(editing as AttachedAnimal).formatPropAsHeader}
          obj={editing as AttachedAnimal}
          btn={
            <Button
              size='large'
              variant='outlined'
              color='default'
              className='button'
              onClick={(): void => setShowAssignmentHistory((o) => !o)}>
              Device Assignment
            </Button>
          }
        />
      )}
    </Container>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: InboundObj, modifyCanSave = true): void => {
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              {FormSection(
                'cr-ids',
                'Identifiers',
                identifierFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'cr-chars',
                'Characteristics',
                characteristicsFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'cr-asoc',
                'Association With Another Individual',
                associatedAnimalFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'cr-comm',
                'Comments About This Animal',
                animalCommentField.map((f) => CreateFormField(editing, f, onChange))
              )}
              {/* hide all workflow related fields when creating a new animal */}
              {!isCreatingNew ? (
                <>
                  {FormSection(
                    'cr-cap',
                    'Latest Capture Details',
                    captureFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled} )),
                    <Button 
                      disabled={!isAttached}
                      {...editEventBtnProps}
                      onClick={(): void => handleOpenWorkflow('capture')}>
                      Add Capture Event
                    </Button>
                  )}
                  {FormSection(
                    'cr-rel',
                    'Latest Release Details',
                    releaseFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button 
                      disabled={!isAttached}
                      {...editEventBtnProps} 
                      onClick={(): void => handleOpenWorkflow('release')}>
                      Add Release Event
                    </Button>
                  )}
                  {FormSection(
                    'cr-mort',
                    'Mortality Details',
                    mortalityFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button
                      disabled={!isAttached}
                      {...editEventBtnProps}
                      onClick={(): void => handleOpenWorkflow('mortality')}>
                      Record Mortality Details
                    </Button>
                  )}
                  {/* hide device assignment history for new critters */}
                  <AssignmentHistory
                    open={showAssignmentHistory}
                    handleClose={(): void => setShowAssignmentHistory(false)}
                    critter_id={editing.critter_id}
                    permission_type={editing.permission_type}
                  />
                  <WorkflowWrapper
                    open={showWorkflowForm}
                    event={event}
                    handleClose={(): void => setShowWorkflowForm(false)}
                    onEventSaved={handleEventSaved}
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
