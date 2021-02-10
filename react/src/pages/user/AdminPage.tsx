import { useState } from 'react';
import { NotificationMessage } from 'components/common';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccess';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useResponseState } from 'contexts/ApiResponseContext';
import AuthLayout from 'pages/layouts/AuthLayout';
import { Typography } from '@material-ui/core';

export default function AdminPage(): JSX.Element {
  const responseState = useResponseState();
  const [ids, setIds] = useState<User>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const tableProps: ITableQueryProps<User> = { query: 'useUsers' };

  const handleTableSelect = (users: User): void => {
    setIds(users);
  };

  const onClickShowModal = (b: boolean): void => {
    setShowModal((o) => !o);
  };
  const onSave = () => {
    // do nothing
  };

  return (
    <AuthLayout>
      <Typography variant='h4' component='div'>Modify User Animal Access</Typography>
      <Typography variant='body2' component='p'>A user has access to collars through the user-animal association.</Typography>
      <Table
        headers={['id', 'idir', 'bceid', 'email', 'role_type']}
        title='Users'
        queryProps={tableProps}
        onSelect={handleTableSelect}
      />
      {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null}
      <Button disabled={!ids} onClick={(): void => onClickShowModal(true)}>
        Edit
      </Button>
      <GrantCritterModal show={showModal} onClose={(): void => setShowModal(false)} onSave={onSave} users={ids} />
    </AuthLayout>
  );
}
