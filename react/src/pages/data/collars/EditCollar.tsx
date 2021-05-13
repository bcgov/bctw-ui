import { Paper, Typography } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT, validateRequiredFields, FormInputType } from 'components/form/form_helpers';
import useModalStyles from 'components/modal/modal_styles';
import { CollarStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import EditModal from 'pages/data/common/EditModal';
import { useEffect, useState } from 'react';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { removeProps } from 'utils/common';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Modal from 'components/modal/Modal';
import { formatLabel } from 'types/common_helpers';

export default function EditCollar(props: CritterCollarModalProps<Collar>): JSX.Element {
  const { isEdit, editing } = props;
  const modalClasses = useModalStyles();

  //const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  const canEdit = !isEdit ? true : true;

  // set the collar type when add collar is selected
  const [collarType, setCollarType] = useState<eNewCollarType>(eNewCollarType.Other);
  const [newCollar, setNewCollar] = useState<Collar>(editing);

  const title = isEdit ? `Editing device ${editing.device_id}` : `Add a new ${collarType} collar`;
  const requiredFields = CS.requiredProps;
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState<boolean>(false);

  useEffect(() => {
    const ipt = getInputTypesOfT<Collar>(
      isEdit ? editing : newCollar,
      allFields,
      allFields.filter((f) => f.isCode).map((r) => r.prop)
    );
    setInputTypes(ipt);
  }, [editing, newCollar]);

  const validate = (o: Collar): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const close = (): void => {
    setCollarType(eNewCollarType.Other);
    setErrors({});
  };

  const handleChooseCollarType = (type: eNewCollarType): void => {
    setCollarType(type);
    setNewCollar(new Collar(type));
  };

  const { communicationFields, deviceOptionFields, identifierFields, purchaseFields, statusFields, userCommentField } = collarFormFields;
  const allFields = [ ...communicationFields, ...deviceOptionFields, ...identifierFields, ...purchaseFields, ...statusFields, ...userCommentField ];

  const makeField = (
    iType: FormInputType,
    handleChange: (v: Record<string, unknown>) => void,
    isError: boolean,
    span?: boolean
  ): React.ReactNode => {
    const isRequired = requiredFields.includes(iType.key);
    const errorText = isError && (errors[iType.key] as string);
    return MakeEditField({
      formType: iType,
      handleChange,
      required: isRequired,
      errorMessage: errorText,
      label: formatLabel(editing, iType.key),
      span: true
    });
  };

  // render the choose collar type form if the add button was clicked
  const chooseCollarType = (): JSX.Element => {
    return (
      <>
        <Typography>{CS.addCollarTypeText}</Typography>
        <div color='primary' className={modalClasses.btns}>
          <Button onClick={(): void => handleChooseCollarType(eNewCollarType.VHF)}>{eNewCollarType.VHF}</Button>
          <Button onClick={(): void => handleChooseCollarType(eNewCollarType.Vect)}>{eNewCollarType.Vect}</Button>
        </div>
      </>
    );
  };

  const padFrequency = (num: number): string => {
    const freq = num.toString();
    const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
    const numToAdd = 3 - numDecimalPlaces + freq.length;
    return freq.padEnd(numToAdd, '0');
  };

  const isAddNewCollar = !isEdit && collarType === eNewCollarType.Other;
  return (
    <EditModal
      title={title}
      newT={new Collar()}
      onValidate={validate}
      onReset={close}
      isEdit={isEdit}
      hideSave={isAddNewCollar}
      {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): React.ReactNode => {
          // do form validation before passing change handler to EditModal
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              {isAddNewCollar ? (
                chooseCollarType()
              ) : (
                <form className='rootEditInput' autoComplete='off'>
                  <Paper className={'dlg-full-title'} elevation={3}>
                    <div className={'dlg-full-sub'}>
                      <h1>Device ID: {editing.device_id}</h1>
                      <div className={'dlg-full-sub'}>
                        <span className='span'>
                          Frequency: {editing?.frequency ? padFrequency(editing.frequency) : '-'} MHz
                        </span>
                        <span className='span'>|</span>
                        <span className='span'>Deployment Status: {editing?.device_deployment_status}</span>
                        <span className='button_span'>
                          {isEdit ? (
                            <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                              Assign Animal to Device
                            </Button>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </Paper>
                  <Paper elevation={0}>
                    <h2>Device Details</h2>
                    <Paper elevation={3} className={'dlg-full-body-details'}>
                      <div className={'dlg-details-section'}>
                        <h3>Identifiers</h3>
                        {inputTypes
                          .filter((f) => identifierFields.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      <div className={'dlg-details-section'}>
                        <h3>Device Status</h3>
                        {inputTypes
                          .filter((f) => statusFields.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      <div className={'dlg-details-section'}>
                        <h3>Satellite Network &amp; Beacon Frequency</h3>
                        {inputTypes
                          .filter((f) => communicationFields.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      <div className={'dlg-details-section'}>
                        <h3>Comments About This Device</h3>
                        {inputTypes
                          .filter((f) => userCommentField.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      <div className={'dlg-details-section'}>
                        <h3>Additional Device Sensors &amp; Features</h3>
                        {inputTypes
                          .filter((f) => deviceOptionFields.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      <div className={'dlg-details-section'}>
                        <h3>Purchase Details</h3>
                        {inputTypes
                          .filter((f) => purchaseFields.map((x) => x.prop).includes(f.key))
                          .map((d) => makeField(d, onChange, !!errors[d.key]))}
                      </div>
                      {isEdit && showAssignmentHistory ? (
                        <Modal open={showAssignmentHistory} handleClose={(): void => setShowAssignmentHistory(false)}>
                          <AssignmentHistory
                            assignAnimalToDevice={true}
                            animalId=''
                            deviceId={editing.collar_id}
                            canEdit={canEdit}
                            {...props}
                          />
                        </Modal>
                      ) : null}
                    </Paper>
                  </Paper>
                </form>
              )}
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
