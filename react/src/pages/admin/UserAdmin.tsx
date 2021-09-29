import { useState } from 'react';
import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import AuthLayout from 'pages/layouts/AuthLayout';
import { User } from 'types/user';
import EditUser from 'pages/user/EditUser';

/**
 * page for user admin. requires admin user role.  
 * uses @component {EditUser}
 */
export default function UserAdminPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [userModified, setUserModified] = useState<User>({} as User);

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  const handleTableRowSelect = (u: User): void => setUserModified(u);

  const onSaveSuccess = () => {
    // todo:
  }

  const onError = () => {
    // todo:
  }
  const onDeleteSuccess = () => {
    // todo:
  }

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateUser({ onSuccess: onSaveSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDeleteSuccess, onError });

  const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
    console.log('AdminPage: im saving a user', u);
    await saveMutation(u.body)
  };

  const deleteUser = async (id: string): Promise<void> => {
    const payload: IDeleteType = { id, objType: 'user' };
    console.log('deleting user', payload);
    await deleteMutation(payload);
  }

  return (
    <AuthLayout>
      <div className='container'>
        <h1>BCTW Users</h1>
        <DataTable
          headers={['id', 'role_type', 'idir', 'bceid', 'firstname', 'lastname', 'email']}
          title='Users'
          queryProps={tableProps}
          onSelect={handleTableRowSelect}
        />
        <div className={'button-row'}>
          <AddEditViewer<User> editText={'User'} addText={'User'} editing={userModified} empty={new User()} onSave={saveUser} onDelete={deleteUser}>
            <EditUser editing={new User()} open={false} onSave={null} handleClose={null} />
          </AddEditViewer>
        </div>
      </div>
    </AuthLayout>
  );

}