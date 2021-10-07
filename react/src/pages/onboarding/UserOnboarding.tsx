import UserAccessRequest from 'components/onboarding/Request';
import UserAccessPending from 'components/onboarding/Pending';
import UserAccessDenied from 'components/onboarding/Denied';
import { useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { OnboardingStatus } from 'types/onboarding';
import { formatTime } from 'utils/time';
import { Box } from '@material-ui/core';

/**
 * # UserOnboarding
 * This page displays one of four things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 * 4. Access approved
 */

const UserOnboarding = (): JSX.Element => {
  const api = useTelemetryApi();
  const { data, status } = api.useOnboardStatus();

  const [userAccess, setUserAccess] = useState<OnboardingStatus | null>(null);
  // const [userEmail, setUserEmail] = useState('');

  useDidMountEffect(() => {
    if (status === 'success') {
      // setUserEmail(data.email);
      setUserAccess(data.access);
    }
  }, [data]);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100vw'
  };

  return (
    <div style={containerStyle}>
      {/* <div>
        <p>User's email is: {userEmail}</p>
        <p>User's access is: {userAccess}</p>
      </div> */}
      {
        userAccess ? ( // User is in the system
          <div>
            {userAccess === 'granted' ? <UserAccessRequest /> : ''}
            {userAccess === 'pending' ? <UserAccessPending /> : ''}
            {userAccess === 'denied' && data.canRequestBeResubmitted ? <UserAccessRequest children={<Box>Your last access request was denied on {data.valid_to.format(formatTime)}</Box> } /> : <UserAccessDenied onboard={data} />}
          </div>
        ) : (
          <UserAccessRequest />
        ) // If here you're not in the system
      }
    </div>
  );
};

export default UserOnboarding;
