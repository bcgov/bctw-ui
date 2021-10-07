import { OutlinedTextFieldProps, StandardTextFieldProps } from '@material-ui/core';
import { Box, Button, Grid, TextField } from '@material-ui/core';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { createUrl } from 'api/api_helpers';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { eUserRole, IKeyCloakSessionInfo, KeyCloakDomainType } from 'types/user';
import { IOnboardUser, OnboardUser } from 'types/onboarding';

type UserAccessRequestProps = { children?: ReactNode }
/**
 * where unauthorized users are directed to submit a request for access to BCTW
 */

const UserAccessRequest = ({children}: UserAccessRequestProps): JSX.Element => {
  const accessType = eUserRole.observer;
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
  const [domain, setDomain] = useState<KeyCloakDomainType>('idir');

  // create access request stub
  const onSuccess = (u: IOnboardUser): void => {
    console.log('UserOnboarding: Request: new user onboarding submission response', u);
  };
  const onError = (e): void => {
    console.log('UserOnboarding: Request: error submitting new user onboarding', e);
  };
  const api = useTelemetryApi();
  const { mutateAsync: saveMutation } = api.useSubmitOnboardingRequest({ onSuccess, onError });

  const email = keycloakUser?.email ?? 'email@address.com';
  const firstName = keycloakUser?.given_name ?? 'given_Name';
  const lastName = keycloakUser?.family_name ?? 'last_Name';
  const username = keycloakUser?.username ?? 'username';

  // as user is not onboarded, use Keycloak user details instead of from local database
  useEffect(() => {
    const { session } = useKeycloakUser;
    if (session) {
      setKeycloakUser(session);
      setDomain(session.domain);
    }
  }, [useKeycloakUser]);

  // visual feedback to user while page is loading
  // if (!keycloakUser) {
  //   return <div>Loading...</div>;
  // }

  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitRequest = async (): Promise<void> => {
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
    };

    const url = createUrl({ api: 'onboarding', noApiPrefix: true });
    console.log('submitRequest() -- Payload to CHES:', JSON.stringify(payload));

    const request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    // send the email
    const emailResponse = await fetch(request);
    console.log(`email response status ${emailResponse.status}:`, emailResponse);

    // create a new User object
    const newUser = new OnboardUser();
    newUser.role_type = accessType;
    newUser.domain = domain;
    newUser.username = username;
    newUser.email = email;
    newUser.firstname = firstName;
    newUser.lastname = lastName;
    newUser.phone = textMessageNumber;
    newUser.reason = reason;
    newUser.access = 'pending';
    console.log(`UserOnboarding: Request: submitRequest: submitting onboarding request`, newUser);
    await saveMutation(newUser);
  };

  const textProps: Pick<StandardTextFieldProps, 'size'> & Pick<OutlinedTextFieldProps, 'variant'> = {
    size: 'small',
    variant: 'outlined'
  };

  return (
    <Box px={4} py={1}>
      <Box className='fieldset-form'>
        <h1>Request Access</h1>
        {children}
        <div>
          <p>
            You will need to provide some additional details before accessing this application. Complete the request
            details form below to obtain access.
          </p>
        </div>
        <h4>Complete the following information:</h4>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField label='Your Name' value={`${firstName} ${lastName}`} {...textProps} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Identity Type' {...textProps} value={domain} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Username' {...textProps} value={username} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Email addresss' {...textProps} value={email} disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Project Name' onChange={(e): void => setProjectName(e.target.value)} {...textProps} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Role in Project' onChange={(e): void => setProjectRole(e.target.value)} {...textProps} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Project Manager'
              onChange={(e): void => setProjectManager(e.target.value)}
              {...textProps}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Target Species' onChange={(e): void => setSpecies(e.target.value)} {...textProps} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Region' onChange={(e): void => setRegion(e.target.value)} {...textProps} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Population Unit Name'
              onChange={(e): void => setPopulationUnit(e.target.value)}
              {...textProps}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              style={{ width: '25%' }}
              rows={3}
              multiline
              {...textProps}
              placeholder='Describe the reason for wanting access to this application'
              onChange={(e): void => setReason(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Phone (for alerts only)'
              onChange={(e): void => setTextMessageNumber(e.target.value)}
              variant={'outlined'}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' color='primary' onClick={submitRequest}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserAccessRequest;
