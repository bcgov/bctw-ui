import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Button } from 'components/common';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { AttachedCollar, Collar, collarFormFields } from 'types/collar';
import { IWorkflow, SuperWorkflow, WorkflowType, editObjectToEvent } from 'types/events/event';
import { wfFields } from 'types/events/form_fields';
import MalfunctionEvent from 'types/events/malfunction_event';
import RetrievalEvent from 'types/events/retrieval_event';
import { parseFormChangeResult } from 'types/form_types';
import { permissionCanModify } from 'types/permission';
import { FormSection, editEventBtnProps } from '../common/EditModalComponents';
import WorkflowWrapper from '../events/WorkflowWrapper';

export default function EditCollar(props: EditorProps<Collar | AttachedCollar>): JSX.Element {
  const { isCreatingNew, editing } = props;

  const isAttached = editing instanceof AttachedCollar;
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  const [isVHF, setIsVHF] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasDropoff, setHasDropoff] = useState(false);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState<MalfunctionEvent | RetrievalEvent>(new MalfunctionEvent());

  const createEvent = (type: WorkflowType): MalfunctionEvent | RetrievalEvent => {
    if (type === 'retrieval') {
      return editObjectToEvent(editing, new RetrievalEvent(), [
        'retrieved_ind',
        'retrieval_date',
        'device_deployment_status'
      ]);
    } else if (type === 'malfunction') {
      return editObjectToEvent(
        editing,
        new MalfunctionEvent(editing instanceof AttachedCollar ? editing.last_transmission_date : null),
        ['device_status', 'device_condition', 'device_deployment_status']
      );
    }
  };

  const handleOpenWorkflow = (e: WorkflowType): void => {
    const event = createEvent(e);
    updateEvent(event);
    setShowWorkflowForm((o) => !o);
  };

  // if a malfunction event is saved and the device is retrieved, open the retrieval workflow
  const handleWorkflowSaved = async (e: SuperWorkflow): Promise<void> => {
    await setShowWorkflowForm(false);
    if (e.event_type === 'malfunction' && e instanceof MalfunctionEvent && !!e.retrieved_ind) {
      // console.log('im supposed to show the retrieval form', e);
      const retrievalWF = editObjectToEvent(e, new RetrievalEvent(), ['event_type']);
      await updateEvent(retrievalWF); // fixme:
      await setShowWorkflowForm((o) => !o);
    }
  };

  const {
    frequencyFields,
    deviceOptionFields,
    identifierFields,
    activationFields,
    statusFields,
    retrievalFields,
    malfunctionOfflineFields
  } = collarFormFields;

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
    <EditModal
      headerComponent={Header}
      hideSave={!canEdit}
      onReset={close}
      {...props}
      editing={new Collar(editing.collar_id)}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>): void => {
            handlerFromContext(v);
            const [key, value] = parseFormChangeResult<Collar>(v);
            if (key === 'device_type') {
              setIsVHF(value === 'VHF');
            } else if (key === 'activation_status_ind') {
              setIsActive(!!value);
            } else if (key === 'dropoff_device_id') {
              setHasDropoff(!!value);
            }
          };
          return (
            <>
              <FormSection id='d-ids' header='Identifiers' disabled={!canEdit}>
                {identifierFields.map((f) => CreateFormField(editing, f, onChange))}
              </FormSection>
              <FormSection id='d-sat' header='Satellite Network and Beacon Frequency' disabled={!canEdit}>
                {[
                  CreateFormField(editing, wfFields.get('device_type'), onChange),
                  CreateFormField(editing, wfFields.get('satellite_network'), onChange, {
                    required: !isVHF,
                    disabled: isVHF
                  }),
                  frequencyFields.map((f) => CreateFormField(editing, f, onChange))
                ]}
              </FormSection>
              <FormSection id='d-status' header='Device Status' disabled={!canEdit}>
                {statusFields.map((f) => CreateFormField(editing, f, onChange))}
              </FormSection>

              <FormSection id='d-add' header='Warranty & Activation Details' disabled={!canEdit}>
                {[
                  CreateFormField(editing, wfFields.get('activation_status_ind'), onChange, {
                    labelPlacement: 'start'
                  }),
                  activationFields.map((f) => CreateFormField(editing, { ...f, required: isActive }, onChange)),
                  CreateFormField(editing, wfFields.get('activation_comment'), onChange, { disabled: !isActive })
                ]}
              </FormSection>
              <FormSection id='d-activ' header='Additional Device Sensors and Beacons' disabled={!canEdit}>
                {[
                  CreateFormField(editing, wfFields.get('camera_device_id'), onChange),
                  CreateFormField(editing, wfFields.get('dropoff_device_id'), onChange),
                  deviceOptionFields.map((f) =>
                    CreateFormField(editing, f, onChange, { required: hasDropoff, disabled: !hasDropoff })
                  )
                ]}
              </FormSection>
              <FormSection id='d-comment' header='Comments About this Device' disabled={!isActive}>
                {CreateFormField(editing, wfFields.get('device_comment'), onChange, { disabled: !isActive })}
              </FormSection>
              {/**
               * hide the workflow related fields entirely when creating a new collar
               * note: disable the workflow event buttons for unattached devices as
               * last transmission date is not received for unattached
               */}
              {!isCreatingNew ? (
                <>
                  <FormSection
                    id='d-ret'
                    header='Record Retrieval Details'
                    disabled={true}
                    btn={
                      <Button
                        disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleOpenWorkflow('retrieval')}>
                        Record Retrieval Details
                      </Button>
                    }>
                    {retrievalFields.map((f) => CreateFormField(editing, f, onChange))}
                  </FormSection>

                  <FormSection
                    id='d-malf'
                    header='Record Malfunction & Offline Details'
                    disabled={true}
                    btn={
                      <Button
                        disabled={!isAttached}
                        {...editEventBtnProps}
                        onClick={(): void => handleOpenWorkflow('malfunction')}>
                        Record Malfunction & Offline Details
                      </Button>
                    }>
                    {malfunctionOfflineFields.map((f) => CreateFormField(editing, f, onChange))}
                  </FormSection>
                  <WorkflowWrapper
                    open={showWorkflowForm}
                    event={event}
                    handleClose={(): void => setShowWorkflowForm(false)}
                    onEventSaved={handleWorkflowSaved}
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
