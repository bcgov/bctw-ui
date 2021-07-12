import { Paper } from '@material-ui/core';
import { EditorProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { MakeEditField } from 'components/form/create_form_components';
import { CritterStrings as CS } from 'constants/strings';
import ChangeContext from 'contexts/InputChangeContext';
import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import EditModal from 'pages/data/common/EditModal';
import { useState } from 'react';
import { Animal, critterFormFields } from 'types/animal';
import { FormFieldObject } from 'types/form_types';
import { permissionCanModify } from 'types/permission';

/**
 * the main animal form
 * todo: complete capture/release/mortality workflows -> uncomment when complete
*/
export default function EditCritter(props: EditorProps<Animal>): JSX.Element {
  const { isCreatingNew, editing } = props;

  const canEdit = permissionCanModify(editing.permission_type) || isCreatingNew;
  const requiredFields = CS.requiredProps;

  const [showAssignmentHistory, setShowAssignmentHistory] = useState<boolean>(false);
  // const [showCaptureWorkflow, setShowCaptureWorkflow] = useState<boolean>(false);
  // const [showReleaseWorkflow, setShowReleaseWorkflow] = useState<boolean>(false);
  // const [showMortalityWorkflow, setShowMortalityWorkflow] = useState<boolean>(false);

  const {
    associatedAnimalFields,
    captureFields,
    characteristicsFields,
    identifierFields,
    mortalityFields,
    releaseFields,
    userCommentField
  } = critterFormFields;

  const makeFormField = (
    formType: FormFieldObject<Animal>,
    handleChange: (v: Record<string, unknown>) => void
  ): React.ReactNode => {
    const { prop, type, codeName } = formType;
    return MakeEditField({
      type, 
      prop,
      value: editing[prop],
      handleChange,
      disabled: !canEdit,
      required: requiredFields.includes(prop),
      label: editing.formatPropAsHeader(prop),
      span: true,
      codeName
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
            <span className='span'>|</span>
            <span className='span'>Permission: {editing.permission_type}</span>
            <span className='button_span'>
              <Button className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
                Device Assignment
              </Button>
              {/* note: add these when workflows completed  */}
              {/* <Button className='button' onClick={(): void => setShowCaptureWorkflow((o) => !o)}>
                Capture Event
              </Button>
              <Button className='button' onClick={(): void => setShowReleaseWorkflow((o) => !o)}>
                Release Event
              </Button>
              <Button className='button' onClick={(): void => setShowMortalityWorkflow((o) => !o)}>
                Mortality Event
              </Button> */}
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
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              <Paper elevation={0} className={'dlg-full-form'}>
                {/* <h2>Animal Details</h2> */}
                <div className={'dlg-details-section'}>
                  <h3>Identifiers</h3>
                  {identifierFields.map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Characteristics</h3>
                  {characteristicsFields.map((formType) => makeFormField(formType, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Association With Another Individual</h3>
                  {associatedAnimalFields.map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Comments About This Animal</h3>
                  {userCommentField.map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Latest Capture Details</h3>
                  {captureFields.map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Latest Release Details</h3>
                  {releaseFields.map((f) => makeFormField(f, onChange))}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Mortality Details</h3>
                  {mortalityFields.map((f) => makeFormField(f, onChange))}
                </div>
                {/* dont show assignment history for new critters */}
                {!isCreatingNew ? (
                  <AssignmentHistory
                    open={showAssignmentHistory}
                    handleClose={(): void => setShowAssignmentHistory(false)}
                    critter_id={editing.critter_id}
                    permission_type={editing.permission_type}
                  />
                ) : null}

                {/* {!isCreatingNew && showCaptureWorkflow ? (
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
                ) : null} */}
              </Paper>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
