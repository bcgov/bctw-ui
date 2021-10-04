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

/**
 * page for user admin. requires admin user role.
 */
export default function UserAdminPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const [userModified, setUserModified] = useState<User>({} as User);

  const handleTableRowSelect = (u: User): void => setUserModified(u);

  const onSaveSuccess = (u: User): void => {
    responseDispatch({ severity: 'success', message: `${u.username} saved!` });
  };

  const onError = (error: AxiosError): void => responseDispatch({ severity: 'error', message: formatAxiosError(error) });

  const onDeleteSuccess = (): void => {
    // todo:
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useSaveUser({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
    console.log('AdminPage: im saving a user', u);
    await saveMutation(u.body);
  };

  const deleteUser = async (id: string): Promise<void> => {
    const payload: IDeleteType = { id, objType: 'user' };
    console.log('deleting user', payload);
    await deleteMutation(payload);
  };

  return (
    <AuthLayout>
      <div className='container'>
        <h1>BCTW Users</h1>
        <DataTable
          headers={['id', 'role_type', 'username', 'domain', 'firstname', 'lastname', 'email']}
          title='Users'
          queryProps={{ query: bctwApi.useUsers }}
          onSelect={handleTableRowSelect}
        />
        <div className={'button-row'}>
          <AddEditViewer<User>
            queryStatus='success'
            editText={'User'}
            addText={'User'}
            editing={userModified}
            empty={new User()}
            onSave={saveUser}
            onDelete={deleteUser}>
            <EditUser editing={new User()} open={false} onSave={null} handleClose={null} />
          </AddEditViewer>
        </div>
      </div>
    </AuthLayout>
  );
}
