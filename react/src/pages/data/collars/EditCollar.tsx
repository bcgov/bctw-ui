import Box from '@material-ui/core/Box';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import Container from '@material-ui/core/Container';
import EditModal from 'pages/data/common/EditModal';
import MalfunctionEventForm from '../events/MalfunctionEventForm';
import Modal from 'components/modal/Modal';
import RetrievalEventForm from '../events/RetrievalEventForm';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, FormSection } from '../common/EditModalComponents';
import RetrievalEvent from 'types/events/retrieval_event';
import { EventType } from 'types/events/event';
import useDidMountEffect from 'hooks/useDidMountEffect';
import EventWrapper from '../events/EventWrapper';

/**
 * todo: reimplement auto defaulting of fields based on collar type select
 */
export default function EditCollar(props: EditorProps<Collar>): JSX.Element {
  const { isCreatingNew, editing } = props;

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  // const title = isCreatingNew ? `Add a new ${collarType} collar` : `Editing device ${editing.device_id}`;
  const [showRetrievalWorkflow, setShowRetrievalWorkflow] = useState<boolean>(false);
  const [showMalfunctionWorkflow, setShowMalfunctionWorkflow] = useState<boolean>(false);

  const [workflowType, setWorkflowType] = useState<EventType>('unknown');
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState(new RetrievalEvent()); //fixme: type this

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
  };

  useDidMountEffect(async () => {
    updateEvent(() => {
      let e;
      if (workflowType === 'retrieval') {
        e = new RetrievalEvent();
      } else {
        e = new RetrievalEvent();
      }
      const o = Object.assign(e, editing);
      return o;
    });
  }, [workflowType]);

  // show the workflow form when a new event object is created
  useDidMountEffect(() => {
    if (event) {
      console.log('event updated', event, !open);
      setShowWorkflowForm((o) => !o);
    }
  }, [event]);

  const handleOpenWorkflow = (e: EventType): void => {
    if (workflowType === e) {
      setShowWorkflowForm((o) => !o);
    } else {
      setWorkflowType(e);
    }
  };

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
            {/* <span className='button_span'>
              {!isCreatingNew ? (
                <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                  Assign Animal to Device
                </Button>
              ) : null}
            </span> */}
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
                identifierFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'device-status',
                'Device Status',
                statusFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'device-sat',
                'Satellite Network and Beacon Frequency',
                communicationFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'device-add',
                'Additional Device Sensors and Beacons',
                activationFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'device-activ',
                'Warranty & Activation Details',
                deviceOptionFields.map((f) => CreateFormField(editing, f, onChange))
              )}
              {FormSection(
                'device-ret',
                'Record Retrieval Details',
                retrievalFields.map((f) => CreateFormField(editing, f, onChange)),
                <Button {...editEventBtnProps} onClick={(): void => handleOpenWorkflow('retrieval')}>
                  Record Retrieval Details
                </Button>
              )}
              {FormSection(
                'device-malf',
                'Record Malfunction & Offline Details',
                malfunctionOfflineFields.map((f) => CreateFormField(editing, f, onChange)),
                <Button {...editEventBtnProps} onClick={(): void => setShowMalfunctionWorkflow((o) => !o)}>
                  Record Malfunction & Offline Details
                </Button>
              )}
              {FormSection(
                'device-comment',
                'Comments About this Device',
                deviceCommentField.map((f) => CreateFormField(editing, f, onChange))
              )}
              {/* malfunction workflow */}
              {!isCreatingNew && showMalfunctionWorkflow ? (
                <Modal open={showMalfunctionWorkflow} handleClose={(): void => setShowMalfunctionWorkflow(false)}>
                  <MalfunctionEventForm
                    device_id={editing.device_id}
                    handleClose={(): void => setShowMalfunctionWorkflow(false)}
                    handleSave={null}
                    open={showMalfunctionWorkflow}
                  />
                </Modal>
              ) : null}
              <EventWrapper
                eventType={workflowType}
                open={showWorkflowForm}
                event={event}
                handleClose={(): void => setShowWorkflowForm(false)}
              />
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
