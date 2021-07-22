import { Box, Container, Grid, Paper } from '@material-ui/core';
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
    <Container maxWidth="xl">
      {isCreatingNew ? (
      <Box pt={3}>
        <Box component="h1" mt={0} mb={0}>
          Add Animal
        </Box>
      </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="top" pt={3}>
            <Box>
              <Box component="h1" mt={0} mb={1}>
                WLH ID: {editing?.wlh_id ?? '-'} &nbsp;<span style={{ fontWeight: 100 }}>/</span>&nbsp; Animal ID:{' '} {editing?.animal_id ?? '-'}
              </Box>
              <dl className="headergroup-dl">
                <dd>Species:</dd>
                <dt>{editing.species}</dt>
                <dd>Device ID:</dd>
                <dt>{editing.device_id ?? 'Unassigned'}</dt>
                <dd>BCTW ID:</dd>
                <dt>{editing.critter_id}</dt>
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

            <Box>
              <Button size="large" variant="outlined" color="default" className='button' onClick={(): void => setShowAssignmentHistory((o) => !o)}>
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
            </Box>
          </Box>
        </>
      )}
    </Container>
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
              {/* <h2>Animal Details</h2> */}
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Identifiers</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {identifierFields.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Characteristics</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {characteristicsFields.map((formType) => makeFormField(formType, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Association With Another Individual</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {associatedAnimalFields.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Comments About This Animal</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {userCommentField.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Latest Capture Details</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {captureFields.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Latest Release Details</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {releaseFields.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Mortality Details</Box>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {mortalityFields.map((f) => makeFormField(f, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

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
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
