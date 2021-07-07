import React from 'react';
import { useState, useEffect } from "react";
import {
  FormControl,
  TextField,
  NativeSelect,
  InputLabel,
  TextareaAutosize,
  Button,
  ButtonGroup
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

  const [state, setState] = React.useState({
    projectName: '',
    projectRole: '',
    projectManager: '',
    species: '',
    region:'',
    populationUnit:'',
    access:'',
    description: ''
  });

  const accessChosen = (e) => {
    setState({...state,access:e.target.value})
  }

  /**
   * ##clearForm
   * Blank all our state
   * **Currently this doesn't blank the form.**
   */
  const clearForm = () => {
      setProjectName('');
      setProjectRole('');
      setProjectManager('');
      setSpecies('');
      setRegion('');
      setPopulationUnit('');
      setAccess('');
      setDescription('');
  }

  const submitForm = () => {
    console.log(projectName);
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
      ></TextField>
      <TextField label='Role in Project'></TextField>
      <TextField label='Project Manager'></TextField>
      <TextField label='Target Species'></TextField>
      <TextField label='Region'></TextField>
      <TextField label='Population Unit Name'></TextField>

      <FormControl>
        <InputLabel>Target Level of Access</InputLabel>
        <NativeSelect
          onChange={accessChosen}
          value={state.access}
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
      ></TextareaAutosize>

      <ButtonGroup>
        {/* <Button
          variant='contained'
          onClick={clearForm}
        >Cancel</Button> */}
        <Button
          variant='contained'
          color='primary'
          onClick={submitForm}
        >Submit</Button>
      </ButtonGroup>


    </div>
  )
}
export default RequestUser;
