import { OutlinedTextFieldProps, StandardTextFieldProps } from '@mui/material';
import { Box, Button, Grid, TextField } from '@mui/material';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { eUserRole, IKeyCloakSessionInfo, KeyCloakDomainType } from 'types/user';
import { IOnboardUser, OnboardUserRequest } from 'types/onboarding';
import PhoneInput from 'components/form/PhoneInput';
import { InboundObj } from 'types/form_types';
import { formatAxiosError } from 'utils/errors';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

type UserAccessRequestProps = { children?: ReactNode };
/**
 * where unauthorized users are directed to submit a request for access to BCTW
 */

const UserAccessRequest = ({ children }: UserAccessRequestProps): JSX.Element => {
  const showNotif = useResponseDispatch();
  const api = useTelemetryApi();

  const accessType = eUserRole.user;
  const [populationUnit, setPopulationUnit] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [reason, setReason] = useState('');
  const [region, setRegion] = useState('');
  const [taxon, settaxon] = useState('');
  const [textMessageNumber, setTextMessageNumber] = useState('');

  const useKeycloakUser = useContext(UserContext);
  const [keycloakUser, setKeycloakUser] = useState<IKeyCloakSessionInfo>(null);
  const [domain, setDomain] = useState<KeyCloakDomainType>('idir');
  console.log(useKeycloakUser);
  // create access request stub
  const onSuccess = (u: IOnboardUser): void => {
    showNotif({ severity: 'success', message: `User onboarding request submitted` });
    console.log('UserOnboarding: Request: new user onboarding submission response', u);
  };
  const onError = (e): void => {
    showNotif({ severity: 'error', message: `${formatAxiosError(e)}` });
  };

  const { mutateAsync: saveMutation } = api.useSubmitOnboardingRequest({ onSuccess, onError });

  const email = keycloakUser?.email ?? 'email@address.com';
  const firstName = keycloakUser?.given_name ?? 'given_Name';
  const lastName = keycloakUser?.family_name ?? 'last_Name';
  const username = keycloakUser?.username ?? 'username';
  const keycloak_guid = keycloakUser?.keycloak_guid;

  // as user is not onboarded, use Keycloak user details instead of from local database
  useEffect(() => {
    const { session } = useKeycloakUser;
    if (session) {
      setKeycloakUser(session);
      setDomain(session.domain);
    }
  }, [useKeycloakUser]);

  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitRequest = async (): Promise<void> => {
    const newUser = new OnboardUserRequest();
    const { user, emailInfo } = newUser;
    user.keycloak_guid = keycloak_guid;
    user.role_type = accessType;
    user.domain = domain;
    user.username = username;
    user.email = email;
    user.firstname = firstName;
    user.lastname = lastName;
    user.phone = textMessageNumber;
    user.reason = reason;
    user.access = 'pending';
    emailInfo.populationUnit = populationUnit;
    emailInfo.projectManager = projectManager;
    emailInfo.projectName = projectName;
    emailInfo.projectRole = projectRole;
    emailInfo.region = region;
    emailInfo.taxon = taxon;
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
            <TextField label='Target taxon' onChange={(e): void => settaxon(e.target.value)} {...textProps} />
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
            <PhoneInput
              defaultValue={textMessageNumber}
              propName={'phone'}
              label={'Phone (for alerts only)'}
              changeHandler={(v: InboundObj): void => setTextMessageNumber(v['phone'] as string)}
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
