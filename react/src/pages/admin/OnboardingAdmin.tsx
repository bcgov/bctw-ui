import DataTable from 'components/table/DataTable';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { OnboardUser } from 'types/onboarding';

/**
 * page for user admin. requires admin user role.  
 * 
 * uses @component {EditUser}
 */
export default function OnboardingAdminPage(): JSX.Element {
  const api = useTelemetryApi();

  const onSuccess = (): void => {
    // todo:
  }

  const onError = (): void => {
    // todo:
  }

  // setup the mutations
  const { mutateAsync: saveMutation } = api.useMutateUser({ onSuccess: onSuccess, onError });

  // const saveUser = async (u: IUpsertPayload<User>): Promise<void> => {
  //   console.log('AdminPage: im saving a user', u);
  //   await saveMutation(u.body)
  // };

  return (
    <AuthLayout>
      <div className='container'>
        <DataTable
          headers={new OnboardUser().displayProps}
          title='Pending BCTW onboarding requests'
          queryProps={{query: api.useOnboardRequests}}
          // onSelect={handleTableRowSelect}
        />
        {/* <div className={'button-row'}>
          <AddEditViewer<User> editText={'User'} addText={'User'} editing={userModified} empty={new User()} onSave={saveUser} onDelete={deleteUser}>
            <EditUser editing={new User()} open={false} onSave={null} handleClose={null} />
          </AddEditViewer>
        </div> */}
      </div>
    </AuthLayout>
  );

}