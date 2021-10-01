import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import Button from 'components/form/Button';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { HandleOnboardInput, OnboardUser } from 'types/onboarding';
import ConfirmModal from 'components/modal/ConfirmModal';
import { OnboardStrings } from 'constants/strings';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';

/**
 *
 */
export default function OnboardingAdminPage(): JSX.Element {
  const api = useTelemetryApi();
  const [request, setRequest] = useState<OnboardUser | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const responseDispatch = useResponseDispatch();

  const handleSelectRequest = (o: OnboardUser): void => {
    setRequest(o);
  };

  const onSuccess = (result: boolean): void => {
    const message = result ? `user ${request.username} created successfully` : `onboarding request denied`;
    responseDispatch({ severity: 'success', message });
  };

  const onError = (e: AxiosError): void => {
    responseDispatch({ severity: 'error', message: formatAxiosError(e)});
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = api.useHandleOnboardingRequest({ onSuccess: onSuccess, onError });

  const grantOrDenyRequest = async (): Promise<void> => {
    const { onboarding_id, role_type } = request;
    const body: HandleOnboardInput = {
      onboarding_id,
      role_type,
      access: isGranting ? 'granted' : 'denied'
    };
    // console.log(body)
    saveMutation(body);
    setShowConfirm(o => !o);
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
        <DataTable
          headers={new OnboardUser().displayProps}
          title='Pending BCTW onboarding requests'
          queryProps={{ query: api.useOnboardRequests }}
          onSelect={handleSelectRequest}
        />
        <div className={'button-row'}>
          <Button color='primary' disabled={!request || request?.access !== 'pending'} onClick={(): void => handleClickGrantOrDeny(true)}>
            Grant
          </Button>
          <Button color='secondary' disabled={!request || request?.access !== 'pending'} onClick={(): void => handleClickGrantOrDeny(false)}>
            Deny
          </Button>
        </div>
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
