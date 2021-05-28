import { Paper } from '@material-ui/core';
import { EditorProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT, validateRequiredFields } from 'components/form/form_helpers';
import Modal from 'components/modal/Modal';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import CaptureWorkflow from 'pages/data/animals/CaptureWorkflow';
import ReleaseWorkflow from 'pages/data/animals/ReleaseWorkflow';
import MortalityEventForm from 'pages/data/events/MortalityEventForm';
import EditModal from 'pages/data/common/EditModal';
import React, { useEffect, useState } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { eCritterPermission } from 'types/user';
import { removeProps } from 'utils/common';
import { TelemetryAlert } from 'types/alert';
import { FormInputType } from 'types/form_types';

export default function EditCritter(props: EditorProps<Animal>): JSX.Element {
  const { isCreatingNew, editing } = props;

  // for new critters, permission will be undefined
  const canEdit = editing.permission_type === eCritterPermission.change || editing.permission_type === undefined;
  const requiredFields = CS.requiredProps;

  // const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState<boolean>(false);
  const [showCaptureWorkflow, setShowCaptureWorkflow] = useState<boolean>(false);
  const [showReleaseWorkflow, setShowReleaseWorkflow] = useState<boolean>(false);
  const [showMortalityWorkflow, setShowMortalityWorkflow] = useState<boolean>(false);

  useEffect(() => {
    const updateFields = (): void => {
      const inputTypes = getInputTypesOfT<Animal>(
        editing,
        allFields,
        allFields.filter((f) => f.isCode).map((a) => a.prop)
      );
      setInputTypes(inputTypes);
    };
    updateFields();
  }, [editing]);

  // const validateForm = (o: Animal): boolean => {
  //   const errors = validateRequiredFields(o, requiredFields);
  //   setErrors(errors);
  //   const hasErrors = Object.keys(errors).length !== 0;
  //   if (hasErrors && props.validateFailed) {
  //     props.validateFailed(errors);
  //   }
  //   return !hasErrors;
  // };

  // fixme:
  const alert = new TelemetryAlert();
  {
    alert.critter_id = editing.critter_id;
    alert.collar_id = '12345';
    alert.device_id = editing.device_id;
    alert.wlh_id = editing.wlh_id;
    alert.valid_from = editing.valid_from; // Does this make sense?
  }

  const {
    associatedAnimalFields,
    captureFields,
    characteristicsFields,
    identifierFields,
    mortalityFields,
    releaseFields,
    userCommentField
  } = critterFormFields;

  const allFields = [
    ...associatedAnimalFields,
    ...captureFields,
    ...characteristicsFields,
    ...identifierFields,
    ...mortalityFields,
    ...releaseFields,
    ...userCommentField
  ];

  const makeFormField = (
    formType: FormInputType,
    handleChange: (v: Record<string, unknown>) => void
  ): React.ReactNode => {
    const { key } = formType;
    return MakeEditField({
      formType,
      handleChange,
      disabled: !canEdit,
      required: requiredFields.includes(key),
      label: editing.formatPropAsHeader(key),
      /* does the errors object have a property matching this key?
        if so, get its error
      */
      // errorMessage: !!errors[key] && (errors[key] as string),
      span: true
    });
  };

  const Header = (
    <Paper className={'dlg-full-title'} elevation={3}>
      {isCreatingNew ? (
        <h1>Create an Animal</h1>
      ) : (
        <>
          <h1>
            WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{ fontWeight: 100 }}>/</span>&nbsp; Animal ID:{' '}
            {editing?.animal_id ?? '-'}
          </h1>
          <div className={'dlg-full-sub'}>
            <span className='span'>Species: {editing.species}</span>
            <span className='span'>|</span>
            <span className='span'>Device: {editing.device_id ?? 'Unassigned'}</span>
            <span className='span'>|</span>
            <span className='span'>BCTW ID: {editing.critter_id}</span>
            <span className='button_span'>
              <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                Assign Device to Animal
              </Button>
              <Button className='button' onClick={(): void => setShowCaptureWorkflow((o) => !o)}>
                Capture Event
              </Button>
              <Button className='button' onClick={(): void => setShowReleaseWorkflow((o) => !o)}>
                Release Event
              </Button>
              <Button className='button' onClick={(): void => setShowMortalityWorkflow((o) => !o)}>
                Mortality Event
              </Button>
            </span>
          </div>
        </>
      )}
    </Paper>
  );

  return (
    <EditModal headerComponent={Header} hideSave={!canEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            // if (v) {
            //   setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            // }
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              <Paper elevation={0} className={'dlg-full-form'}>
                {/* <h2>Animal Details</h2> */}
                <div className={'dlg-details-section'}>
                  <h3>Identifiers</h3>
                  {inputTypes
                    .filter((f) => identifierFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Characteristics</h3>
                  {inputTypes
                    .filter((f) => characteristicsFields.map((x) => x.prop).includes(f.key))
                    .map((formType) => makeFormField(formType, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Association With Another Individual</h3>
                  {inputTypes
                    .filter((f) => associatedAnimalFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Comments About This Animal</h3>
                  {inputTypes
                    .filter((f) => userCommentField.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Latest Capture Details</h3>
                  {inputTypes
                    .filter((f) => captureFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Latest Release Details</h3>
                  {inputTypes
                    .filter((f) => releaseFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Mortality Details</h3>
                  {inputTypes
                    .filter((f) => mortalityFields.map((x) => x.prop).includes(f.key))
                    .map((f) => makeFormField(f, onChange))}
                </div>
                {/* dont show assignment history for new critters */}
                {!isCreatingNew && showAssignmentHistory ? (
                  <Modal open={showAssignmentHistory} handleClose={(): void => setShowAssignmentHistory(false)}>
                    <AssignmentHistory animalId={editing.critter_id} deviceId='' canEdit={canEdit} {...props} />
                  </Modal>
                ) : null}
                {!isCreatingNew && showCaptureWorkflow ? (
                  <Modal open={showCaptureWorkflow} handleClose={(): void => setShowCaptureWorkflow(false)}>
                    <CaptureWorkflow animalId={editing.critter_id} canEdit={canEdit} {...props} />
                  </Modal>
                ) : null}
                {!isCreatingNew && showReleaseWorkflow ? (
                  <Modal open={showReleaseWorkflow} handleClose={(): void => setShowReleaseWorkflow(false)}>
                    <ReleaseWorkflow animalId={editing.critter_id} canEdit={canEdit} {...props} />
                  </Modal>
                ) : null}
                {!isCreatingNew && showMortalityWorkflow ? (
                  <MortalityEventForm
                    alert={alert}
                    open={showMortalityWorkflow}
                    handleClose={(): void => setShowMortalityWorkflow(false)}
                    handleSave={null}
                  />
                ) : null}
              </Paper>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
