import Box from '@material-ui/core/Box';
import Button from 'components/form/Button';
import ChangeContext from 'contexts/InputChangeContext';
import Container from '@material-ui/core/Container';
import EditModal from 'pages/data/common/EditModal';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { EditorProps } from 'components/component_interfaces';
import { CreateFormField } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, FormSection } from '../common/EditModalComponents';
import RetrievalEvent from 'types/events/retrieval_event';
import { editObjectToEvent, WorkflowType } from 'types/events/event';
import useDidMountEffect from 'hooks/useDidMountEffect';
import WorkflowWrapper from '../events/WorkflowWrapper';
import { isDisabled } from 'types/form_types';
import MalfunctionEvent from 'types/events/malfunction_event';

/**
 * todo: reimplement auto defaulting of fields based on collar type select
 */
export default function EditCollar(props: EditorProps<Collar>): JSX.Element {
  const { isCreatingNew, editing } = props;

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);
  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;

  const [workflowType, setWorkflowType] = useState<WorkflowType>('unknown');
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [event, updateEvent] = useState(new RetrievalEvent()); //fixme: type this

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
  };

  useDidMountEffect(async () => {
    updateEvent(() => {
      let e, o;
      if (workflowType === 'retrieval') {
        e = new RetrievalEvent();
        o = editObjectToEvent(Object.assign({}, editing), e, ['retrieved', 'retrieval_date', 'device_deployment_status']);
      } else if (workflowType === 'malfunction') {
        e = new MalfunctionEvent();
        o = editObjectToEvent(Object.assign({}, editing), e, ['device_status', 'device_condition', 'device_deployment_status']);
      }
      return o;
    });
  }, [workflowType]);

  // show the workflow form when a new event object is created
  useDidMountEffect(() => {
    if (event) {
      // console.log('event updated', event, !open);
      setShowWorkflowForm((o) => !o);
    }
  }, [event]);

  const handleOpenWorkflow = (e: WorkflowType): void => {
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
              {!isCreatingNew ? (
                <>
                  {FormSection(
                    'device-ret',
                    'Record Retrieval Details',
                    retrievalFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button {...editEventBtnProps} onClick={(): void => handleOpenWorkflow('retrieval')}>
                      Record Retrieval Details
                    </Button>
                  )}
                  {FormSection(
                    'device-malf',
                    'Record Malfunction & Offline Details',
                    malfunctionOfflineFields.map((f) => CreateFormField(editing, f, onChange, {...isDisabled})),
                    <Button {...editEventBtnProps} onClick={(): void => handleOpenWorkflow('malfunction')}>
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
                  />
                </> ) : null }
            </>
          )
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
