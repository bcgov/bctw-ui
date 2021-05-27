import { useState } from 'react';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccess';
import { ITableQueryProps } from 'components/table/table_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

export default function AdminPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [ids, setIds] = useState<User>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const tableProps: ITableQueryProps<User> = { query: bctwApi.useUsers };

  const handleTableSelect = (users: User): void => {
    setIds(users);
  };

  const onClickShowModal = (b: boolean): void => {
    setShowModal(b);
  };
  const onSave = (): void => {
    // handled in GrantCritterModal
  };

  return (
    <AuthLayout>
      <div className='container'>
        <Typography variant='h4' component='div'>
          Modify User Animal Access
        </Typography>
        <Typography variant='body2' component='p'>
          A user has access to devices through the user-animal association.
        </Typography>
        <Table
          headers={['id', 'idir', 'bceid', 'email', 'role_type']}
          title='Users'
          queryProps={tableProps}
          onSelect={handleTableSelect}
        />
        {/* {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null} */}
        <div className='admin-btn-row'>
          <Button disabled={!ids} onClick={(): void => onClickShowModal(true)}>Edit User Access</Button>
          {/* todo: */}
          {/* <Button onClick={(): void => onClickShowModal(true)}>Edit User</Button> */}
        </div>
        <GrantCritterModal show={showModal} onClose={(): void => setShowModal(false)} onSave={onSave} users={ids} />
      </div>
    </AuthLayout>
  );
}
