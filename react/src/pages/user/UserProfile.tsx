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
import { isDev } from 'api/api_helpers';

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
    sendSmsMortality(phoneNumber);
  }

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user }
  };
  const Span = (props): JSX.Element => (
    <Typography>
      <label style={{textAlign: 'right', marginRight: '20px'}}>{props.label}</label>
      <span style={{fontWeight: 'bolder', marginRight: '20px'}}>{props.msg}</span>
      {props.child}
    </Typography>
  );
  return (
    <ManageLayout>
      <div className='container'>
        <h1>My Profile</h1>
        <Box display={'grid'} my={2} >
          <Span label={'Name:'} msg={user.name}/>
          <Span label={'Username:'} msg={user.username}/>
          <Span label={'Role:'} msg={user.role_type}/>
          <Span label={'Email:'} msg={user.email}/>
          <Span label={'Phone:'} msg={user.phone ?? 'No number on file'} child={
            isDev() ? (
              <Button disabled={!user.phone} size='small' onClick={(): void => sendTestSms(user.phone)}>
                Send test SMS
              </Button>
            ) : null
          }/>
        </Box>
        <DataTable
          headers={UserCritterAccess.propsToDisplay}
          title='Animals you have access to:'
          queryProps={tableProps}
        />
      </div>
    </ManageLayout>
  );
}
