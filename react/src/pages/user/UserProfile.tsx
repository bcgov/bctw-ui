import { Button } from 'components/common';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/UserContext';
import { User } from 'types/user';
import { Box, Typography } from '@mui/material';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import { UserCritterAccess } from 'types/animal_access';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

export default function UserProfile(): JSX.Element {
  const useUser = useContext(UserContext);
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [user, setUser] = useState<User>({} as User);
  const [showTestConfirm, setShowTestConfirm] = useState(false);

  // set the user state when the context is updated
  useEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user);
    }
  }, [useUser]);

  if (!user) {
    return <div>Loading user information...</div>;
  }

  // setup the mutation if the user wants to test notifications
  const { mutateAsync: performNotificationTest } = api.useTestNotifications();

  const handleClickTestNotifs = async (): Promise<void> => {
    const { email, phone } = user;
    await performNotificationTest({ email, phone });
    setShowTestConfirm(o => !o);
    showNotif({severity: 'info', message: 'notification triggered, please check your inbox & phone shortly'});
  };

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: api.useCritterAccess,
    param: { user }
  };
  const Span = (props): JSX.Element => (
    <Typography>
      <label style={{ textAlign: 'right', marginRight: '20px' }}>{props.label}</label>
      <span style={{ fontWeight: 'bolder', marginRight: '20px' }}>{props.msg}</span>
      {props.child}
    </Typography>
  );
  return (
    <ManageLayout>
      <div className='container'>
        <h1>My Profile</h1>
        <Box display={'grid'} my={2}>
          <Span label={'Name:'} msg={user.name} />
          <Span label={'Username:'} msg={user.username} />
          <Span label={'Role:'} msg={user.role_type} />
          <Span label={'Email:'} msg={user.email} />
          <Span
            label={'Phone:'}
            msg={user.phone ?? 'No number on file'}
            child={
              <Button
                disabled={!user.phone || !user.email}
                color='secondary'
                size='small'
                onClick={(): void => setShowTestConfirm((o) => !o)}>
                Send test notifications
              </Button>
            }
          />
        </Box>
        <DataTable
          headers={UserCritterAccess.propsToDisplay}
          title='Animals you have access to:'
          queryProps={tableProps}
        />
        <ConfirmModal
          handleClickYes={handleClickTestNotifs}
          handleClose={(): void => setShowTestConfirm(false)}
          open={showTestConfirm}
          title='You are about to trigger a simulated mortality alert'
          message={`An email will be sent to ${user.email} and an SMS will be sent to ${user.phone}. Are you sure you want to proceed?`}
        />
      </div>
    </ManageLayout>
  );
}
