import { Button } from 'components/common';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { User } from 'types/user';
import { Box, Typography } from '@mui/material';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { sendSmsMortality } from 'utils/gcNotify';
import { UserCritterAccess } from 'types/animal_access';

export default function UserProfile(): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();

  const [user, setUser] = useState<User>({} as User);

  // set the user state when the context is updated
  useEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user)
    }
  }, [useUser]);

  if (!user) {
    return <div>Loading user information...</div>;
  }

  function sendTestSms(phoneNumber): void {
    alert('Test SMS will be sent to: ' + phoneNumber);
    // console.log('Sending test SMS to ' + phoneNumber);
    sendSmsMortality(phoneNumber);
  }

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user }
  };

  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Profile</h1>
      </Box>
      <div style={{margin: '20px'}}>
        <Typography>
          <p>
            Your Name: <strong>{user.firstname ?? 'Local'}</strong>&nbsp;<strong>{user.lastname ?? 'User'}</strong>
          </p>
          <p>
            Your username: <strong>{user.identifier}\{user.uid?? 'Local Username'}</strong>
          </p>
          <p>
            Your Role: <strong>{user.role_type}</strong>
          </p>
          <p>
            Your email address: <strong>{user.email}</strong>
          </p>
          <p>
            Your phone number: <strong>{user.phone ?? 'No number on file'}</strong> &nbsp; &nbsp; 
            <Button className='button' onClick={(): void => sendTestSms(user.phone)}>
              Send test SMS
            </Button>
          </p>
        </Typography>
        <DataTable
          headers={UserCritterAccess.propsToDisplay}
          title='Animals you have access to:'
          queryProps={tableProps}
        />
      </div>
    </ManageLayout>
  );
}
