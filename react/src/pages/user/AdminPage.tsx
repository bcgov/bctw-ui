import { useState } from 'react';
import { ITableQueryProps } from 'api/api_interfaces';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { User } from 'types/user';

export default function AdminPage(): JSX.Element {
  const [editing, setEditing] = useState<User[]>([]);
  const bctwApi = useTelemetryApi();

  const tableProps: ITableQueryProps<User> = {
    query: 'useUsers',
  };

  const handleTableSelect  = (n) => {
    console.log(n);
  }

  return (
    <>
      <Table
        headers={['id', 'idir', 'bceid', 'email', 'role_type']}
        title='Users'
        isMultiSelect={true}
        queryProps={tableProps}
        onSelectMultiple={handleTableSelect}
        rowIdentifier='id'
      />
      {/* <AddEditViewer editing={editing} empty={() => []} >
        <div>hi</div>
      </AddEditViewer> */}

    </>
  );
}
