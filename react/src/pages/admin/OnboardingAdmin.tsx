import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { HandleOnboardInput, OnboardUser } from 'types/onboarding';
import ConfirmModal from 'components/modal/ConfirmModal';
import { OnboardStrings } from 'constants/strings';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { Button } from 'components/common';
import { Box, Typography } from '@mui/material';

/**
 *
 */
export default function OnboardingAdminPage(): JSX.Element {
  const api = useTelemetryApi();
  const [request, setRequest] = useState<OnboardUser | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const showNotif = useResponseDispatch();

  const handleSelectRequest = (o: OnboardUser): void => {
    setRequest(o);
  };

  const onSuccess = (result: boolean): void => {
    const message = result ? `user ${request.username} created successfully` : `onboarding request denied`;
    showNotif({ severity: 'success', message });
  };

  const onError = (e: AxiosError): void => {
    showNotif({ severity: 'error', message: formatAxiosError(e) });
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = api.useHandleOnboardingRequest({ onSuccess: onSuccess, onError });

  const grantOrDenyRequest = async (): Promise<void> => {
    const { onboarding_id, role_type, email, firstname, keycloak_guid } = request;
    const body: HandleOnboardInput = {
      firstname,
      onboarding_id,
      email,
      role_type,
      access: isGranting ? 'granted' : 'denied',
      keycloak_guid
    };
    saveMutation(body);
    setShowConfirm((o) => !o);
  };

  const handleClickGrantOrDeny = (b: boolean): void => {
    const { username, role_type } = request;
    setIsGranting(b);
    setMsg(b ? OnboardStrings.confirmGrant(username, role_type) : OnboardStrings.denyGrant(username));
    setShowConfirm((o) => !o);
  };

  return (
    <AuthLayout>
      <div className='container'>
        <h1>Onboarding Requests</h1>
        <Typography mb={3} variant='body1' component='p'>
          Grant or deny new user requests. Only requests with Access type pending can be modified.
        </Typography>
        <DataTable
          headers={new OnboardUser().displayProps}
          title='New user requests'
          queryProps={{ query: api.useOnboardRequests }}
          onSelect={handleSelectRequest}
        />
        <Box display='flex' justifyContent={'flex-start'} columnGap={1}>
          <Button
            disabled={!request || request?.access !== 'pending'}
            onClick={(): void => handleClickGrantOrDeny(true)}>
            Grant
          </Button>
          <Button
            color='secondary'
            disabled={!request || request?.access !== 'pending'}
            onClick={(): void => handleClickGrantOrDeny(false)}>
            Deny
          </Button>
        </Box>
      </div>
      <ConfirmModal
        open={showConfirm}
        handleClickYes={(): Promise<void> => grantOrDenyRequest()}
        handleClose={(): void => setShowConfirm(false)}
        message={msg}
      />
    </AuthLayout>
  );
}
