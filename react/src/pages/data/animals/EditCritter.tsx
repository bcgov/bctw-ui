import { Paper } from '@material-ui/core';
import { CritterCollarModalProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT, validateRequiredFields, FormInputType } from 'components/form/form_helpers';
import Modal from 'components/modal/Modal';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import CaptureWorkflow from 'pages/data/animals/CaptureWorkflow';
import ReleaseWorkflow from 'pages/data/animals/ReleaseWorkflow';
import MortalityWorkflow from 'pages/data/animals/MortalityWorkflow';
import EditModal from 'pages/data/common/EditModal';
import React, { useEffect, useState } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { eCritterPermission } from 'types/user';
import { removeProps } from 'utils/common';

export default function EditCritter(props: CritterCollarModalProps<Animal>): JSX.Element {
  const { isEdit, editing } = props;

  const canEdit = !isEdit ? true : editing.permission_type === eCritterPermission.change;
  const requiredFields = CS.requiredProps;

  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [inputTypes, setInputTypes] = useState<FormInputType[]>([]);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState<boolean>(false);
  const [showCaptureWorkflow, setShowCaptureWorkflow] = useState<boolean>(false);
  const [showReleaseWorkflow, setShowReleaseWorkflow] = useState<boolean>(false);
  const [showMortalityWorkflow, setShowMortalityWorkflow] = useState<boolean>(false);

  useEffect(() => {
    setInputTypes(
      getInputTypesOfT<Animal>(
        editing,
        allFields.map((a) => a.prop),
        allFields.filter((f) => f.isCode).map((a) => a.prop)
      )
    );
  }, [editing]);

  // fixme: pure
  const validateForm = (o: Animal): boolean => {
    const errors = validateRequiredFields(o, requiredFields);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createTitle = (): string =>
    !isEdit ? 'Add a new animal' : `${canEdit ? 'Editing' : 'Viewing'} ${editing.name}`;

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

  return (
    <EditModal title={createTitle()} newT={new Animal()} onValidate={validateForm} isEdit={isEdit} {...props}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            handlerFromContext(v, modifyCanSave);
          };

          const makeFormField = (formType: FormInputType): React.ReactNode => {
            return MakeEditField({
              formType,
              handleChange: onChange,
              disabled: !canEdit,
              required: requiredFields.includes(formType.key),
              errorMessage: !!errors[formType.key] && (errors[formType.key] as string),
              span: true
            });
          };
          return (
            <form className='rootEditInput' autoComplete='off'>
              <Paper className={'dlg-full-title'} elevation={3}>
                <h1>WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{fontWeight:100}}>/</span>&nbsp; Animal ID: {editing?.animal_id ?? '-'}</h1>
                <div className={'dlg-full-sub'}>
                  <span className='span'>Species: {editing.species}</span>
                  <span className='span'>|</span>
                  <span className='span'>Device: {editing.device_id ?? 'Unassigned'}</span>
                  <span className='button_span'>
                    {isEdit ? (
                      <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                        Device Assignment
                      </Button>
                    ) : null}
                    {isEdit ? (
                      <Button className='button' onClick={(): void => setShowCaptureWorkflow((o) => !o)}>
                        Capture Event
                      </Button>
                    ) : null}
                    {isEdit ? (
                      <Button className='button' onClick={(): void => setShowReleaseWorkflow((o) => !o)}>
                        Release Event
                      </Button>
                    ) : null}
                    {isEdit ? (
                      <Button className='button' onClick={(): void => setShowMortalityWorkflow((o) => !o)}>
                        Mortality Event
                      </Button>
                    ) : null}
                    </span>
                </div>
              </Paper>
              <Paper elevation={0} className={'dlg-full-body'}>
                <h2 className={'dlg-full-body-subtitle'}>Animal Details</h2>
                <Paper elevation={3} className={'dlg-full-body-details'}>
                  <div className={'dlg-details-section'}>
                  <h3>Identifiers</h3>
                    {inputTypes
                      .filter((f) => identifierFields.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  <div className={'dlg-details-section'}>
                  <h3>Characteristics</h3>
                    {/* <GridList component={'div'} cellHeight={80} cols={4}> */}
                    {inputTypes
                      .filter((f) => characteristicsFields.map((x) => x.prop).includes(f.key))
                      .map((formType) => makeFormField(formType))}
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Association with Another Individual</h3>
                    {inputTypes
                      .filter((f) => associatedAnimalFields.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Comments About This Animal</h3>
                    {inputTypes
                      .filter((f) => userCommentField.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Latest Capture Details</h3>
                    {inputTypes
                      .filter((f) => captureFields.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Latest Release Details</h3>
                    {inputTypes
                      .filter((f) => releaseFields.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  <div className={'dlg-details-section'}>
                    <h3>Mortality Details</h3>
                    {inputTypes
                      .filter((f) => mortalityFields.map((x) => x.prop).includes(f.key))
                      .map((f) => makeFormField(f))}
                  </div>
                  {/* dont show assignment history for new critters */}
                  {isEdit && showAssignmentHistory ? (
                    <Modal open={showAssignmentHistory} handleClose={(): void => setShowAssignmentHistory(false)}>
                      <AssignmentHistory animalId={editing.critter_id} canEdit={canEdit} {...props} />
                    </Modal>
                  ) : null}
                  {isEdit && showCaptureWorkflow ? (
                    <Modal open={showCaptureWorkflow} handleClose={(): void => setShowCaptureWorkflow(false)}>
                      <CaptureWorkflow animalId={editing.critter_id} canEdit={canEdit} {...props} />
                    </Modal>
                  ) : null}
                  {isEdit && showReleaseWorkflow ? (
                    <Modal open={showReleaseWorkflow} handleClose={(): void => setShowReleaseWorkflow(false)}>
                      <ReleaseWorkflow animalId={editing.critter_id} canEdit={canEdit} {...props} />
                    </Modal>
                  ) : null}
                  {isEdit && showMortalityWorkflow ? (
                    <Modal open={showMortalityWorkflow} handleClose={(): void => setShowMortalityWorkflow(false)}>
                      <MortalityWorkflow animalId={editing.critter_id} canEdit={canEdit} {...props} />
                    </Modal>
                  ) : null}
                </Paper>
              </Paper>
            </form>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
