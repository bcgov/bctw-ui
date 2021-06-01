import { useState } from 'react';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccessModal';
import { ITableQueryProps } from 'components/table/table_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

export default function GrantCritterAccessPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [user, setUser] = useState<User>({} as User);
  const [showModal, setShowModal] = useState<boolean>(false);

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  return (
    <AuthLayout>
      <div className='container'>
        <Typography variant='h4' component='div'>Modify user animal access</Typography>
        {/* <Typography variant='h5' component='div'>Your role: {userModified.role_type ?? 'unknown'}</Typography> */}
        <Typography variant='body2' component='p'>A user has access to devices through the user-animal association.</Typography>
        <Table
          headers={['id', 'idir', 'bceid', 'role_type', 'is_owner']}
          title='Users'
          queryProps={tableProps}
          onSelect={(u: User): void => setUser(u)}
        />
        <div className={'button-row'}>
          <Button disabled={!user?.id} onClick={(): void => setShowModal(true)}>Edit User Animal Access</Button>
        </div>
        <GrantCritterModal show={showModal} onClose={(): void => setShowModal(false)} onSave={null} user={user} />
      </div>
    </AuthLayout>
  );
}
