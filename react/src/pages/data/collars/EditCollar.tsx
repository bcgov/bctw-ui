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
import { FormFromFormfield } from 'components/form/create_form_components';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';
import { editEventBtnProps, FormPart } from '../common/EditModalComponents';

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

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
  };

  // const handleChooseCollarType = (type: eNewCollarType): void => {
  //   setCollarType(type);
  //   setNewCollar(new Collar(type));
  // };

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
    <Container maxWidth="xl">
      {isCreatingNew ? (
        <Box pt={3}>
          <Box component="h1" mt={0} mb={0}>
            Add Device
          </Box>
        </Box>
      ) : (
        <>
          <Box pt={3}>
            <Box component="h1" mt={0} mb={1}>
              Device ID: {editing.device_id}
            </Box>
            <dl className="headergroup-dl">
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
              {FormPart(
                'device-ids',
                'Identifiers',
                identifierFields.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {FormPart(
                'device-status',
                'Device Status',
                statusFields.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {FormPart(
                'device-sat',
                'Satellite Network and Beacon Frequency',
                communicationFields.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {FormPart(
                'device-add',
                'Additional Device Sensors and Beacons',
                activationFields.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {FormPart(
                'device-activ',
                'Warranty & Activation Details',
                deviceOptionFields.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {FormPart(
                'device-ret',
                'Record Retrieval Details',
                retrievalFields.map((f) => FormFromFormfield(editing, f, onChange)),
                <Button {...editEventBtnProps} onClick={(): void => setShowRetrievalWorkflow((o) => !o)}>
                  Record Retrieval Details
                </Button>
              )}
              {FormPart(
                'device-malf',
                'Record Malfunction & Offline Details',
                malfunctionOfflineFields.map((f) => FormFromFormfield(editing, f, onChange)),
                <Button {...editEventBtnProps} onClick={(): void => setShowMalfunctionWorkflow((o) => !o)}>
                  Record Malfunction & Offline Details
                </Button>
              )}
              {FormPart(
                'device-comment',
                'Comments About this Device',
                deviceCommentField.map((f) => FormFromFormfield(editing, f, onChange))
              )}
              {/* {!isCreatingNew && showAssignmentHistory ? (
                <Modal open={showAssignmentHistory} handleClose={(): void => setShowAssignmentHistory(false)}>
                  <AssignmentHistory
                    assignAnimalToDevice={true}
                    critter_id=''
                    deviceId={editing.collar_id}
                    canEdit={true}
                    {...props}
                  />
                </Modal>
              ) : null} */}
              { /* retrieval workflow */ }
              {/* {!isCreatingNew && showRetrievalWorkflow ? (
                <Modal open={showRetrievalWorkflow} handleClose={(): void => setShowRetrievalWorkflow(false)}>
                  <RetrievalEventForm
                    device_id={editing.device_id}
                    handleClose={(): void => setShowRetrievalWorkflow(false)}
                    handleSave={null}
                    open={showRetrievalWorkflow}
                  />
                </Modal>
              ) : null} */}
              { /* malfunction workflow */ }
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
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}