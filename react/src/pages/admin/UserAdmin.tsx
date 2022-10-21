import { useState } from 'react';
import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import DataTable from 'components/table/DataTable';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import AuthLayout from 'pages/layouts/AuthLayout';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { User } from 'types/user';
import EditUser from 'pages/user/EditUser';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserStrings } from 'constants/strings';
import { Typography } from '@mui/material';

/**
 * user management page - requires admin user role.
 */
export default function UserAdminPage(): JSX.Element {
  const api = useTelemetryApi();
  const showAlert = useResponseDispatch();
  const [deleted, setDeleted] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User>({} as User);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // when a user is selected in the data table
  const handleTableRowSelect = (u: User): void => setSelectedUser(u);

  // show notification alerts based on the post status result
  const onSaveSuccess = (u: User): void => showAlert({ severity: 'success', message: `${u.username} saved!` });

  const onError = (error: AxiosError): void =>
    showAlert({ severity: 'error', message: formatAxiosError(error) });

  const onDeleteSuccess = (): void => {
    showAlert({ severity: 'success', message: `user deleted succcesfully` });
    setDeleted(selectedUser.id);
  } 

  // setup the mutations to add/remove users
  const { mutateAsync: saveMutation } = api.useSaveUser({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = api.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
    await saveMutation(u.body);
  };

  const deleteUser = async (): Promise<void> => {
    const payload: IDeleteType = { id: selectedUser.id, objType: 'user' };
    await deleteMutation(payload);
    setShowConfirmDelete(false);
  };

  return (
    <AuthLayout>
      <div className='container'>
        <h1>User Management</h1>
        <Typography mb={3} variant='body1' component='p'>Create or Edit BCTW users</Typography>
        <DataTable
          headers={['id', 'role_type', 'username', 'domain', 'firstname', 'lastname', 'email']}
          title='Users'
          queryProps={{ query: api.useUsers }}
          onSelect={handleTableRowSelect}
          deleted={String(deleted)}
        />
        <div className={'button-row'}>
          <AddEditViewer<User>
            closeAfterSave={true}
            queryStatus={'success'}
            editText={'User'}
            addText={'User'}
            editing={selectedUser}
            empty={new User()}
            onSave={saveUser}
            onDelete={(): void => setShowConfirmDelete((o) => !o)}>
            <EditUser editing={new User()} open={false} onSave={null} handleClose={null} />
          </AddEditViewer>
        </div>
        <ConfirmModal
          handleClickYes={deleteUser}
          open={showConfirmDelete}
          handleClose={(): void => setShowConfirmDelete(false)}
          message={UserStrings.deleteWarning(selectedUser?.username ?? '')}
        />
      </div>
    </AuthLayout>
  );
}
