import 'styles/form.scss';

import { Box, Button, FormControl, Grid, InputLabel, NativeSelect, TextField, TextareaAutosize } from "@material-ui/core";
import { useContext, useEffect, useState } from 'react';
import { createUrl } from 'api/api_helpers';
import { IUserUpsertPayload } from 'api/user_api';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { eUserRole, IKeyCloakSessionInfo, User } from 'types/user';

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

  // create access request stub
  const onSuccess = (v: User): void => {
    console.log('UserContext: new user object is', v);
  }
  const onError = (e): void => {
    console.log('UserContext: error saving user', e)
  }
  const api = useTelemetryApi();
  const { mutateAsync } = api.useMutateUser({ onSuccess, onError });

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

  // feedback to user while page is loading
  if (!keycloakUser) {
    return <div>Loading...</div>;
  }

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
    console.log('submitRequest() -- Payload to CHES:', JSON.stringify(payload));

    const request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    fetch(request)
      .then(async (res) => {

        // create new user in user table with role 'newUser' using Keycloak information
        console.log('UserOnboarding: Request: submitRequest: populating new user object');

        // create a new User object
        const newUser = new User();

        // set username as IDIR or BCeID, as appropriate
        domain === "idir" ? newUser.idir = username : newUser.bceid = username;

        // use enumerated role types
        switch (accessType) {
          case 'administrator':
            console.log('UserOnboarding: Request: submitRequest: role = administrator');
            newUser.role_type = eUserRole.administrator;
            break;
          case 'manager':
            console.log('UserOnboarding: Request: submitRequest: role = owner');
            newUser.role_type = eUserRole.owner;
            break;
          case 'editor':
            console.log('UserOnboarding: Request: submitRequest: role = editor');
            newUser.role_type = eUserRole.editor;
            break;
          case 'observer':
            console.log('UserOnboarding: Request: submitRequest: role = observer');
            newUser.role_type = eUserRole.observer;
            break;
          default:
            console.log('UserOnboarding: Request: submitRequest: warning NO ROLE');
        }

        // set remaining object attributes
        newUser.email = email;
        newUser.firstname = firstName;
        newUser.lastname = lastName;
        newUser.phone = textMessageNumber;

        // set this user as 'access pending'
        newUser.access = 'pending';

        // upsert the new user into the database
        const payload: IUserUpsertPayload = {
          user: newUser,
          role: newUser.role_type
        }
        console.log(`UserOnboarding: Request: submitRequest: Upserting new user ${JSON.stringify(payload)}`);
        await mutateAsync(payload);

      })

      // email could not be sent to CHES
      .catch((err) => {
        console.error('submitRequest() -- Onboarding email COULD NOT be sent:', err);
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