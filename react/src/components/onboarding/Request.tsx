import { useState, useContext} from "react";
import { UserContext } from 'contexts/UserContext'
import {
  FormControl,
  TextField,
  NativeSelect,
  InputLabel,
  TextareaAutosize,
  Button
} from "@material-ui/core";


const RequestUser = (): JSX.Element => {

  /**
   * Would be nice if we could have all our styling inline Victor.
   * Although if you wanna reuse elsewhere I'm not too worried about
   * using a css file.
   */
  const styleMeVictor = {
    maxWidth: '40rem'
  };

  /**
   * Here is all our form state.
   */
  const [projectName, setProjectName] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [species, setSpecies] = useState('');
  const [region, setRegion] = useState('');
  const [populationUnit, setPopulationUnit] = useState('');
  const [access, setAccess] = useState('');
  const [description, setDescription] = useState('');


  // Grab use information from keycloak
  const user =  useContext(UserContext);

  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitForm = () => {
    const payload = {
      projectName,
      projectRole,
      projectManager,
      species,
      region,
      populationUnit,
      access,
      description,
      user: user.user
    }
    console.log(payload);
  }

  return (
    <div className='container' style={styleMeVictor}>
      <h2>Request Access</h2>
      <div>You will need to provide some additional details before accessing this application. Complete the request details form below to obtain access.</div>
      <h3>Request Details</h3>
      <div>Complete the following information</div>

      <TextField
        label='Project Name'
        onChange={(e) => {setProjectName(e.target.value)}}
      />

      <TextField
        label='Role in Project'
        onChange={(e) => {setProjectRole(e.target.value)}}
      />

      <TextField
        label='Project Manager'
        onChange={(e) => {setProjectManager(e.target.value)}}
      />

      <TextField
        label='Target Species'
        onChange={(e) => {setSpecies(e.target.value)}}
      />

      <TextField
        label='Region'
        onChange={(e) => {setRegion(e.target.value)}}
      />

      <TextField
        label='Population Unit Name'
        onChange={(e) => {setPopulationUnit(e.target.value)}}
      />

      <FormControl>
        <InputLabel>Target Level of Access</InputLabel>
        <NativeSelect
          onChange={(e) => {setAccess(e.target.value)}}
          value={access}
        >
          <option value={''}></option>
          <option value={'administer'}>Administer</option>
          <option value={'manager'}>Manager</option>
          <option value={'editor'}>Editor</option>
          <option value={'observer'}>Observer</option>
        </NativeSelect>
      </FormControl>

      <TextareaAutosize
        placeholder="Describe the reason for wanting access to this application"
        onChange={(e) => {setDescription(e.target.value)}}
      />

        <Button
          variant='contained'
          color='primary'
          onClick={submitForm}
        >Submit</Button>

    </div>
  )
}
export default RequestUser;
