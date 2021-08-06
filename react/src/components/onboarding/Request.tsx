import { Box, Grid } from '@material-ui/core';
import { Button, FormControl, InputLabel, NativeSelect, OutlinedInput, TextField, TextareaAutosize } from "@material-ui/core";
import { createUrl } from 'api/api_helpers';
import { useState } from "react";

const RequestUser = (): JSX.Element => {

  /**
   * Would be nice if we could have all our styling inline Victor.
   * Although if you wanna reuse elsewhere I'm not too worried about
   * using a css file.
   */
  const styleMeVictor = {
    padding: '20px'
  };

  /**
   * Here is all our form state.
   */
   const [accessType, setAccessType] = useState('');
   const [populationUnit, setPopulationUnit] = useState('');
   const [projectManager, setProjectManager] = useState('');
   const [projectName, setProjectName] = useState('');
   const [projectRole, setProjectRole] = useState('');
   const [reason, setReason] = useState('');
   const [region, setRegion] = useState('');
   const [textMessageNumber, setTextMessageNumber] = useState('');
   const [species, setSpecies] = useState('');
 
  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitForm = () => {
    const payload = {
      accessType,
      populationUnit,
      projectManager,
      projectName,
      projectRole,
      reason,
      region,
      textMessageNumber,
      species
    }
    const url = createUrl({ api: 'onboarding' });

    // XXX: This url doesn't work in development
    // There is no keycloak in development duh!

    const request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-Type': 'application/json' }
    });

    fetch(request)
      .then((res) => {
        console.log('Your request was sent successfully');
      })
      .catch((err) => {
        console.error('Your request was not successfully', err);
      });
  }

  return (
    <div className='container' style={styleMeVictor}>
      <h2>Request Access</h2>
      <div>
        <p>
          You will need to provide some additional details before accessing this application. Complete the request details form below to obtain access.
        </p>
      </div>
      <h3>Request Details</h3>
      <div>
        <span>Complete the following information:</span>
      </div>
      <Box className="fieldset-form">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div>
              <TextField label='Project Name' onChange={(e) => { setProjectName(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
              <TextField label='Role in Project' onChange={(e) => { setProjectRole(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
              <TextField label='Project Manager' onChange={(e) => { setProjectManager(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
              <TextField label='Target Species' onChange={(e) => { setSpecies(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
              <TextField label='Region' onChange={(e) => { setRegion(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
              <TextField label='Population Unit Name' onChange={(e) => { setPopulationUnit(e.target.value) }} size='small' variant={'outlined'} />
            </div>
            <div>
            <FormControl className={'select-control'} size='small' variant={'outlined'}>
                <InputLabel>Target Level of Access</InputLabel>
                <NativeSelect onChange={(e) => { setAccessType(e.target.value) }} value={accessType} variant={'outlined'}>
                  <option value={''}></option>
                  <option value={'Administrator'}>Administrator</option>
                  <option value={'Manager'}>Manager</option>
                  <option value={'Editor'}>Editor</option>
                  <option value={'Observer'}>Observer</option>
                </NativeSelect>
              </FormControl>
            </div>
            <div>
              <TextareaAutosize placeholder="Describe the reason for wanting access to this application" onChange={(e) => { setReason(e.target.value) }} />
            </div>
            <div>
              <TextField label='Mobile Number to Receive Text Messages' onChange={(e) => { setTextMessageNumber(e.target.value) }} />
            </div>
            <div>
              <Button variant='contained' color='primary' onClick={submitForm}>Submit</Button>
            </div>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default RequestUser;