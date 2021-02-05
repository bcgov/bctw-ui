import { useState } from 'react';
import { NotificationMessage } from 'components/common';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccess';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useResponseState } from 'contexts/ApiResponseContext';
import AuthLayout from 'pages/layouts/AuthLayout';

export default function AdminPage(): JSX.Element {
  const responseState = useResponseState();
  const [ids, setIds] = useState<User[]>([]);
  const [isGrant, setIsGrant] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);


  const tableProps: ITableQueryProps<User> = {
    query: 'useUsers'
  };

  const handleTableSelect = (users: User[]): void =>  {
    setIds(users);
  }

  const onClickShowModal = (b: boolean): void => {
    setIsGrant(b);
    setShowModal((o) => !o);
  } 
  const onSave = () => {
    // do nothing
  };

  return (
    <AuthLayout>
      <Table
        headers={['id', 'idir', 'bceid', 'email', 'role_type']}
        title='Users'
        isMultiSelect={true}
        queryProps={tableProps}
        onSelectMultiple={handleTableSelect}
      />
      {responseState ? <NotificationMessage type={responseState.type} message={responseState.message} /> : null}
      <Button disabled={!ids.length} onClick={(): void => onClickShowModal(true)}>
        Grant Animal(s)
      </Button>
      <Button disabled={ids.length !== 1} onClick={(): void => onClickShowModal(false)}>
        Remove Access
      </Button>
      <GrantCritterModal
        show={showModal}
        isGrantingAccess={isGrant}
        onClose={(): void => setShowModal(false)}
        onSave={onSave}
        users={ids}
      />
    </AuthLayout>
  );
}
