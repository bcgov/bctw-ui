import { useState } from 'react';
import DataTable from 'components/table/DataTable';
import Button from 'components/form/Button';
import { User } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import PickCritterPermissionModal from './PickCritterPermissionModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useQueryClient } from 'react-query';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { adminPermissionOptions, IUserCritterPermissionInput } from 'types/permission';
import { formatAxiosError } from 'utils/errors';
import { IGrantCritterAccessResults } from 'api/permission_api';

/**
 * admin-access only page that allows an admin to grant user-critter permissions
 */
export default function GrantCritterAccessPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [user, setUser] = useState<User>(new User());
  const [showModal, setShowModal] = useState<boolean>(false);
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  // show notification on successful user/critter grant api call
  const onSuccess = (ret: IBulkUploadResults<IGrantCritterAccessResults>): void => {
    const { errors } = ret;
    if (errors.length) {
      responseDispatch({ severity: 'error', message: `${errors.join()}` });
    } else {
      responseDispatch({
        severity: 'success',
        message: `animal access granted for users: ${user.uid}`
      });
      queryClient.invalidateQueries('critterAccess');
    }
  };

  const onError = (error: AxiosError): void => {
    console.error(error);
    responseDispatch({ severity: 'error', message: formatAxiosError(error) });
  }

  const { mutateAsync } = bctwApi.useMutateGrantCritterAccess({ onSuccess, onError });

  const handleSave = async (body: IUserCritterPermissionInput): Promise<void> => {
    console.log(JSON.stringify(body, null, 2));
    await mutateAsync(body);
    setShowModal(false)
  };

  return (
    <AuthLayout>
      <div className='container'>
        <Typography variant='h4' component='div'>Modify user animal access</Typography>
        {/* <Typography variant='h5' component='div'>Your role: {userModified.role_type ?? 'unknown'}</Typography> */}
        <Typography variant='body2' component='p'>A user has access to devices through the user-animal association.</Typography>
        <DataTable
          headers={user.displayProps}
          title='Users'
          queryProps={tableProps}
          // when a row is selected from the data table, set the current user
          onSelect={(u: User): void => setUser(u)}
        />
        <div className={'button-row'}>
          <Button disabled={!user?.id} onClick={(): void => setShowModal(true)}>Edit User Animal Access</Button>
        </div>
        <PickCritterPermissionModal
          open={showModal}
          handleClose={(): void => setShowModal(false)}
          title={`Modifying ${user.uid}'s Animal Access`}
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
