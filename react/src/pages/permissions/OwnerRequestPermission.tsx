
import {  useState } from 'react';
import { User, UserCritterAccess } from 'types/user';
import { Typography } from '@material-ui/core';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import OwnerLayout from 'pages/layouts/OwnerLayout';
import { eCritterPermission } from 'types/permission';

/**
 * fixme: incomplete 
*/
export default function OwnerRequestPermission(): JSX.Element {
  const bctwApi = useTelemetryApi();

  // the actual user object from context
  const [user, setUser] = useState<User>(null);

  // select dropdown options
  // const [testUserOptions, setTestUserOptions] = useState<string[]>([null, 'Biologist1', 'Biologist2']);

  // const queryStr = 'useCritterAccess';
  // const [tblProps, setTblProps] = useState<ITableQueryProps<any>>({query: queryStr, queryParam: testUser})

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user, filter: [eCritterPermission.owner] }
  };

  return (
    <OwnerLayout>
      <div>
        <Typography variant='h5'>Grant animal permissions to other users</Typography>
        <DataTable
          headers={['animal_id', 'wlh_id', 'device_id', 'device_make', 'permission_type']}
          title='Animals you have owner permissions to:'
          queryProps={tableProps}
        />
      </div>
    </OwnerLayout>
  );
}
