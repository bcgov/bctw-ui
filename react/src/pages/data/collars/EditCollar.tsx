import AssignmentHistory from 'pages/data/animals/AssignmentHistory';
import Box from '@material-ui/core/Box';
import Button from 'components/form/Button';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ChangeContext from 'contexts/InputChangeContext';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import EditModal from 'pages/data/common/EditModal';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MalfunctionEventForm from '../events/MalfunctionEventForm';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from 'components/modal/Modal';
import RetrievalEventForm from '../events/RetrievalEventForm';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Collar, collarFormFields, eNewCollarType } from 'types/collar';
import { CollarStrings as CS } from 'constants/strings';
import { EditorProps } from 'components/component_interfaces';
import { FormFieldObject } from 'types/form_types';
import { Icon } from 'components/common';
import { MakeEditField } from 'components/form/create_form_components';
import { formatLabel } from 'utils/common_helpers';
import { permissionCanModify } from 'types/permission';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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
  const [showRetrievalWorkflow, setShowRetrievalWorkflow] = useState<boolean>(false);
  const [showMalfunctionWorkflow, setShowMalfunctionWorkflow] = useState<boolean>(false);

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
    activationFields,
    statusFields,
    retrievalFields,
    malfunctionFields,
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
            // if (v) {
            //   setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            // }
            // console.log(v);
            handlerFromContext(v, modifyCanSave);
          };
          return (
            <>
              <Box component="fieldset" p={3}>
                {/* <h2>Device Details</h2> */}
                <Box component="legend" className={'legend'}>Identifiers</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Device ID"></TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Device Make"></TextField>
                    </Grid>
                  </Grid> */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {identifierFields.map((d) => makeField(d, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Device Status</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={2}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel htmlFor="age-native-simple">Status</InputLabel>
                      <Select>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                      </Select>
                    </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel htmlFor="age-native-simple">Deployment Status</InputLabel>
                        <Select>
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Malfunction Date"
                        InputProps={{
                          endAdornment: <CalendarTodayIcon />
                        }}
                      ></TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel htmlFor="age-native-simple">Type of Malfunction</InputLabel>
                          <Select>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                          </Select>
                        </FormControl>
                    </Grid>
                  </Grid> */}
                  <Box mt={1}>
                    {/* <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box ml={1}>
                          <FormControlLabel control={<Checkbox name="checked" color="primary" />} label="Device was Retrieved" />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={2}>
                        <TextField fullWidth size="small" variant="outlined" label="Date of Retrieval"
                          InputProps={{
                            endAdornment: <CalendarTodayIcon />
                          }}
                        ></TextField>
                      </Grid>
                    </Grid> */}
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {statusFields.map((d) => makeField(d, onChange))}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Satellite Network and Beacon Frequency</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={2}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel htmlFor="age-native-simple">Device Type</InputLabel>
                      <Select>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                      </Select>
                    </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel htmlFor="age-native-simple">Satellite Network</InputLabel>
                        <Select>
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} lg={2}>
                      <TextField type="number" fullWidth size="small" variant="outlined" label="Beacon Frequency"></TextField>
                    </Grid>
                    <Grid item xs={12} sm={4} lg={2}>
                      <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel htmlFor="age-native-simple">Frequency Units</InputLabel>
                          <Select>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                          </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} lg={2}>
                      <TextField type="number" fullWidth size="small" variant="outlined" label="Fix Rate"></TextField>
                    </Grid>
                  </Grid> */}
                  <Box mt={1}>
                    {/* <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box ml={1}>
                          <FormControlLabel control={<Checkbox name="checked" color="primary" />} label="Device is active with vendor" />
                        </Box>
                      </Grid>
                    </Grid> */}
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {communicationFields.map((d) => makeField(d, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Additional Device Sensors and Beacons</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Camera ID"></TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Drop-off ID"></TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Drop-off Freqency"></TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Drop-off Freqency Unit"></TextField>
                    </Grid>
                  </Grid> */}
                  <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {deviceOptionFields.map((d) => makeField(d, onChange))}
                      </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Warranty & Activation Details</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Date of Purchase"
                        InputProps={{
                          endAdornment: <CalendarTodayIcon />
                        }}
                      ></TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField fullWidth size="small" variant="outlined" label="Purchase Comments"></TextField>
                    </Grid>
                  </Grid> */}
                  <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {activationFields.map((d) => makeField(d, onChange))}
                      </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Retrieval Details</Box>
                <Button size="large" color="default" className='button' onClick={(): void => setShowRetrievalWorkflow((o) => !o)}>
                  Record Retrieval Details
                </Button>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {retrievalFields.map((d) => makeField(d, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Malfunction Details</Box>
                <Button size="large" color="default" className='button' onClick={(): void => setShowMalfunctionWorkflow((o) => !o)}>
                  Record Malfunction Details
                </Button>
                <Box className="fieldset-form">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {malfunctionFields.map((d) => makeField(d, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box py={1} px={3}>
                <Divider></Divider>
              </Box>
              <Box component="fieldset" p={3}>
                <Box component="legend" className={'legend'}>Comments About this Device</Box>
                <Box className="fieldset-form">
                  {/* <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField fullWidth multiline size="small" variant="outlined" label="Comments"></TextField>
                    </Grid>
                  </Grid> */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {userCommentField.map((d) => makeField(d, onChange))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
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
              {!isCreatingNew && showRetrievalWorkflow ? (
                <Modal open={showRetrievalWorkflow} handleClose={(): void => setShowRetrievalWorkflow(false)}>
                  <RetrievalEventForm
                    device_id={editing.device_id}
                    handleClose={(): void => setShowRetrievalWorkflow(false)}
                    handleSave={null}
                    open={showRetrievalWorkflow}
                  />
                </Modal>
              ) : null}
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