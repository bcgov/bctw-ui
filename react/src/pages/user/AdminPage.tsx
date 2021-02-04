import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { User } from 'types/user';
import GrantCritterModal from 'pages/user/GrantCritterAccess';
import { ITableQueryProps } from 'components/table/table_interfaces';

export default function AdminPage(): JSX.Element {
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
    <>
      <Table
        headers={['id', 'idir', 'bceid', 'email', 'role_type']}
        title='Users'
        isMultiSelect={true}
        queryProps={tableProps}
        onSelectMultiple={handleTableSelect}
      />
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
    </>
  );
}
