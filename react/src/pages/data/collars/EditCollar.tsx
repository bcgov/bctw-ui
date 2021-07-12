import { Paper } from '@material-ui/core';
import { EditorProps } from 'components/component_interfaces';
import { MakeEditField } from 'components/form/create_form_components';
import { CollarStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import { formatLabel } from 'utils/common_helpers';
import { FormFieldObject } from 'types/form_types';
import { permissionCanModify } from 'types/permission';

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
  const [showAssignmentHistory, setShowAssignmentHistory] = useState<boolean>(false);


  const close = (): void => {
    setCollarType(eNewCollarType.Other);
    // setErrors({});
  };

  // const handleChooseCollarType = (type: eNewCollarType): void => {
  //   setCollarType(type);
  //   setNewCollar(new Collar(type));
  // };

  const {
    communicationFields,
    deviceOptionFields,
    identifierFields,
    purchaseFields,
    statusFields,
    userCommentField
  } = collarFormFields;

  const makeField = (
    t: FormFieldObject<Collar>,
    handleChange: (v: Record<string, unknown>) => void,
  ): React.ReactNode => {
    const { prop, type, codeName } = t;
    const isRequired = CS.requiredProps.includes(prop);
    return MakeEditField({
      prop,
      type,
      value: editing[prop],
      handleChange,
      disabled: !canEdit,
      required: isRequired,
      label: formatLabel(editing, t.prop),
      span: true,
      codeName
    });
  };

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
    <Paper className={'dlg-full-title'} elevation={3}>
      {isCreatingNew ? (
        <h1>Add a Device</h1>
      ) : (
        <>
          <h1>Device ID: {editing.device_id}</h1>
          <div className={'dlg-full-sub'}>
            <div className={'dlg-full-sub'}>
              <span className='span'>Frequency: {editing?.frequency ? editing.frequencyPadded : '-'} MHz</span>
              <span className='span'>|</span>
              <span className='span'>Deployment Status: {editing?.device_deployment_status}</span>
              <span className='span'>|</span>
              <span className='span'>Permission: {editing.permission_type}</span>
              {/* <span className='button_span'>
                {!isCreatingNew ? (
                  <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                    Assign Animal to Device
                  </Button>
                ) : null}
              </span> */}
            </div>
          </div>
        </>
      )}
    </Paper>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} onReset={close} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            // if (v) {
            //   setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            // }
            // console.log(v);
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              <Paper elevation={0} className={'dlg-full-form'}>
                {/* <h2>Device Details</h2> */}
                <div className={'dlg-details-section'}>
                  <h3>Identifiers</h3>
                  {identifierFields.map((d) => makeField(d, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Device Status</h3>
                  {statusFields.map((d) => makeField(d, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Satellite Network &amp; Beacon Frequency</h3>
                  {communicationFields.map((d) => makeField(d, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Comments About This Device</h3>
                  {userCommentField.map((d) => makeField(d, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Additional Device Sensors &amp; Features</h3>
                  {deviceOptionFields.map((d) => makeField(d, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Purchase Details</h3>
                  {purchaseFields.map((d) => makeField(d, onChange))}
                </div>
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
              </Paper>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
