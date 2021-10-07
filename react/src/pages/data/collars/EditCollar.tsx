import Box from '@material-ui/core/Box';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import Container from '@material-ui/core/Container';
import EditModal from 'pages/data/common/EditModal';
import { AttachedCollar, Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, FormSection } from '../common/EditModalComponents';
import RetrievalEvent from 'types/events/retrieval_event';
import { editObjectToEvent, IBCTWWorkflow, WorkflowType } from 'types/events/event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import { isDisabled } from 'types/form_types';
import MalfunctionEvent from 'types/events/malfunction_event';

/**
 * todo: reimplement auto defaulting of fields based on collar type select
 * when creating a new device
 */
export default function EditCollar(props: EditorProps<Collar | AttachedCollar>): JSX.Element {
  const { isCreatingNew, editing } = props;

  const isAttached = editing instanceof AttachedCollar;

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  // const [workflowType, setWorkflowType] = useState<WorkflowType>('unknown');
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState(new MalfunctionEvent());

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
  };

  const createEvent = (type: WorkflowType): MalfunctionEvent | RetrievalEvent => {
    let e, o;
    if (type === 'retrieval') {
      e = new RetrievalEvent();
      o = editObjectToEvent(Object.assign({}, editing), e, ['retrieved', 'retrieval_date', 'device_deployment_status']);
      return o;
    } else if (type === 'malfunction') {
      e = new MalfunctionEvent(editing instanceof AttachedCollar ? editing.last_transmission_date : null);
      o = editObjectToEvent(Object.assign({}, editing), e, ['device_status', 'device_condition', 'device_deployment_status']);
    }
    return o;
  };

  const handleOpenWorkflow = (e: WorkflowType): void => {
    const event = createEvent(e);
    updateEvent(event as any);
    setShowWorkflowForm((o) => !o);
  };

  // if a malfunction event is saved and the device is retrieved, open the retrieval workflow
  const handleWorkflowSaved = async(e: IBCTWWorkflow): Promise<void> => {
    await setShowWorkflowForm(false);
    if (e.event_type === 'malfunction' && e instanceof MalfunctionEvent && !!e.retrieved) {
      // console.log('im supposed to show the retrieval form', e);
      const retrievalWF = editObjectToEvent(e, new RetrievalEvent(), ['event_type']);
      await updateEvent(retrievalWF as any); // fixme: 
      await setShowWorkflowForm(o => !o);
    }
  }

  const {
    communicationFields,
    deviceOptionFields,
    identifierFields,
    activationFields,
    statusFields,
    retrievalFields,
    malfunctionOfflineFields,
    deviceCommentField
  } = collarFormFields;

  // const handleChooseCollarType = (type: eNewCollarType): void => {
  //   setCollarType(type);
  //   setNewCollar(new Collar(type));
  // };

  // render the choose collar type form if the add button was clicked
  // const ChooseCollarType = (
  //   <>
  //     <Typography>{CS.addCollarTypeText}</Typography>
  //     <div color='primary' className={modalClasses.btns}>
  //       <Button onClick={(): void => handleChooseCollarType(eNewCollarType.VHF)}>{eNewCollarType.VHF}</Button>
  //       <Button onClick={(): void => handleChooseCollarType(eNewCollarType.Vect)}>{eNewCollarType.Vect}</Button>
  //     </div>
  //   </>
  // );

  const Header = (
    <Container maxWidth='xl'>
      {isCreatingNew ? (
        <Box pt={3}>
          <Box component='h1' mt={0} mb={0}>
            Add Device
          </Box>
        </Box>
      ) : (
        <>
          <Box pt={3}>
            <Box component='h1' mt={0} mb={1}>
              Device ID: {editing.device_id}
            </Box>
            <dl className='headergroup-dl'>
              <dd>Frequency:</dd>
              <dt>{editing?.frequency ? editing.frequencyPadded : '-'} MHz</dt>
              <dd>Deployment Status:</dd>
              <dt>{editing?.device_deployment_status}</dt>
              <dd>Permission:</dd>
              <dt>{editing.permission_type}</dt>
            </dl>
          </Box>
        </>
      )}
    </Container>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} onReset={close} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              {FormSection(
                'device-ids',
                'Identifiers',
                identifierFields.map((f) => CreateFormField(editing, f, onChange, {disabled: !canEdit}))
              )}
              {FormSection(
                'device-sat',
                'Satellite Network and Beacon Frequency',
                communicationFields.map((f) => CreateFormField(editing, f, onChange, {disabled: !canEdit}))
              )}
              {FormSection(
                'device-add',
                'Additional Device Sensors and Beacons',
                activationFields.map((f) => CreateFormField(editing, f, onChange, {disabled: !canEdit}))
              )}
              {FormSection(
                'device-activ',
                'Warranty & Activation Details',
                deviceOptionFields.map((f) => CreateFormField(editing, f, onChange, {disabled: !canEdit}))
              )}
              {FormSection(
                'device-status',
                'Device Status',
                statusFields.map((f) => CreateFormField(editing, f, onChange, {disabled: !canEdit}))
              )}
              {/**
               * hide the workflow related fields entirely when creating a new collar
               * note: disable the workflow event buttons for unattached devices as
               * last transmission date is not received for unattached
              */
              }
              {!isCreatingNew ? (
                <>
                  {FormSection(
                    'device-ret',
                    'Record Retrieval Details',
                    retrievalFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button disabled={!isAttached} {...editEventBtnProps} onClick={(): void => handleOpenWorkflow('retrieval')}>
                      Record Retrieval Details
                    </Button>
                  )}
                  {FormSection(
                    'device-malf',
                    'Record Malfunction & Offline Details',
                    malfunctionOfflineFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button disabled={!isAttached} {...editEventBtnProps} onClick={(): void => handleOpenWorkflow('malfunction')}>
                      Record Malfunction & Offline Details
                    </Button>
                  )}
                  {FormSection(
                    'device-comment',
                    'Comments About this Device',
                    deviceCommentField.map((f) => CreateFormField(editing, f, onChange))
                  )}
                  <WorkflowWrapper
                    open={showWorkflowForm}
                    event={event}
                    handleClose={(): void => setShowWorkflowForm(false)}
                    onEventSaved={handleWorkflowSaved}
                  />
                </> ) : null }
            </>
          )
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
