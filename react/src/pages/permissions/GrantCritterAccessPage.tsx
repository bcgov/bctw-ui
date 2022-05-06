import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import { Button } from 'components/common';
import { eUserRole, User } from 'types/user';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@mui/material';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import PickCritterPermissionModal from './PickCritterPermissionModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { adminPermissionOptions, IUserCritterPermissionInput } from 'types/permission';
import { formatAxiosError } from 'utils/errors';
import { IGrantCritterAccessResults } from 'api/permission_api';

/**
 * admin-access only page that allows an admin to grant user-critter permissions
 */
export default function GrantCritterAccessPage(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [user, setUser] = useState<User>(new User());
  const [showModal, setShowModal] = useState(false);

  // show notification on successful user/critter grant api call
  const onSuccess = (ret: IBulkUploadResults<IGrantCritterAccessResults>): void => {
    const { errors } = ret;
    if (errors.length) {
      showNotif({ severity: 'error', message: `${errors.join()}` });
    } else {
      showNotif({
        severity: 'success',
        message: `animal access granted for users: ${user.username}`
      });
    }
  };

  const onError = (error: AxiosError): void => {
    console.error(error);
    showNotif({ severity: 'error', message: formatAxiosError(error) });
  }

  const { mutateAsync } = api.useGrantCritterAccess({ onSuccess, onError });

  const handleSave = async (body: IUserCritterPermissionInput): Promise<void> => {
    console.log(JSON.stringify(body, null, 2));
    await mutateAsync(body);
    setShowModal(false)
  };

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Set Animal Manager</h1>
        <Typography mb={3} variant='body1' component='p'>A user has access to devices through the user-animal association.</Typography>
        <DataTable
          headers={user.displayProps.filter(prop => !['idir', 'bceid'].includes(prop))}
          title='Users'
          queryProps={{ query: api.useUsers }}
          onSelect={(u: User): void => setUser(u)}
        />
        <div className={'button-row'}>
          <Button disabled={!user?.id} onClick={(): void => setShowModal(true)}>Edit User Animal Access</Button>
        </div>
        <PickCritterPermissionModal
          open={showModal}
          handleClose={(): void => setShowModal(false)}
          title={`Modifying ${user.username}'s Animal Access`}
          onSave={handleSave}
          filter={adminPermissionOptions}
          alreadySelected={[]}
          showSelectPermission={true}
          userToLoad={user}
        />
      </div>
    </AuthLayout>
  );
}
