import 'styles/form.scss';

import { Box, Grid } from '@material-ui/core';
import { Button, FormControl, InputLabel, NativeSelect, TextField, TextareaAutosize } from "@material-ui/core";
import { IKeyCloakSessionInfo } from 'types/user';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { createUrl } from 'api/api_helpers';

const UserAccessRequest = (): JSX.Element => {

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
  const [species, setSpecies] = useState('');
  const [textMessageNumber, setTextMessageNumber] = useState('');

  const useKeycloakUser = useContext(UserContext);
  const [keycloakUser, setKeycloakUser] = useState<IKeyCloakSessionInfo>(null);

  const domain = keycloakUser?.domain ? keycloakUser.domain : 'domain';
  const email = keycloakUser?.email ? keycloakUser.email : 'email@address.com';
  const firstName = keycloakUser?.given_name ? keycloakUser.given_name : 'given_Name';
  const lastName = keycloakUser?.family_name ? keycloakUser.family_name : 'last_Name';
  const username = keycloakUser?.username ? keycloakUser.username : 'username';

  // as user is not onboarded, use Keycloak user details instead of from local database
  useEffect(() => {
    const { session } = useKeycloakUser;
    if (session) {
      setKeycloakUser(session)
    }
  }, [useKeycloakUser]);

  // if (!keycloakUser) {
  //   return <div>Loading...</div>;
  // }

  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitRequest = () => {
    const payload = {
      accessType,
      domain,
      email,
      firstName,
      lastName,
      populationUnit,
      projectManager,
      projectName,
      projectRole,
      reason,
      region,
      species,
      textMessageNumber,
      username
    }

    const url = createUrl({ api: 'onboarding', noApiPrefix: true });

    // // copied from api_helpers.ts, without the the /api
    // const IS_PROD = +(window.location.port) === 1111 ? false : true;
    // const h1 = window.location.protocol;
    // const h2 = window.location.hostname;
    // const h3 = IS_PROD ? window.location.port : 3000;
    // const url = `${h1}//${h2}:${h3}/onboarding`;

    console.log('submitRequest() -- POSTing to this URL:', url);
    console.log('submitRequest() -- Payload:', JSON.stringify(payload));

    const request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    fetch(request)
      .then((res) => {
        console.log('submitRequest() -- Request sent successfully:', res);
      })
      .catch((err) => {
        console.error('submitRequest() -- Request could not be sent:', err);
      });

  }

  return (
    <Box px={4} py={3}>
      <Box className="fieldset-form">
        <h1>Request Access</h1>
        <div>
          <p>
            You will need to provide some additional details before accessing this application. Complete the request details form below to obtain access.
          </p>
        </div>
        Email: {email}<br />
        First Name: {firstName}<br />
        Last Name: {lastName}<br />
        Domain: {domain}<br />
        Username: {username}<br />
        <h3>Request Details</h3>
        <div>
          <span>Complete the following information:</span>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField label='Your Name' size='small' variant={'outlined'} value={firstName + " " + lastName} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Identity Type' size='small' variant={'outlined'} value={domain} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Username' size='small' variant={'outlined'} value={username} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Email addresss' size='small' variant={'outlined'} value={email} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Project Name' onChange={(e) => { setProjectName(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Role in Project' onChange={(e) => { setProjectRole(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Project Manager' onChange={(e) => { setProjectManager(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Target Species' onChange={(e) => { setSpecies(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Region' onChange={(e) => { setRegion(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Population Unit Name' onChange={(e) => { setPopulationUnit(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={12}>
            <TextareaAutosize placeholder="Describe the reason for wanting access to this application" onChange={(e) => { setReason(e.target.value) }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Mobile Number to Receive Text Messages' onChange={(e) => { setTextMessageNumber(e.target.value) }} variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' onClick={submitRequest}>Submit</Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default UserAccessRequest;