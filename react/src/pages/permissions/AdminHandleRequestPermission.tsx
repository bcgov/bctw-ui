import { NotificationMessage } from 'components/common';
import DataTable from 'components/table/DataTable';
import EditTable from 'components/table/EditTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { useState } from 'react';
import { BCTW } from 'types/common_types';
import { groupPermissionRequests, IGroupedRequest, PermissionRequest } from 'types/permission';
import { formatAxiosError } from 'utils/common';

/**
 * component page that an admin uses to grant or deny permission requests from owners
*/
export default function AdminHandleRequestPermissionPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  // const tblProps: ITableQueryProps<PermissionRequest> = { query: bctwApi.usePermissionRequests };
  const { data, status, error } = bctwApi.usePermissionRequests();
  const [requests, setRequests] = useState<IGroupedRequest[]>([]);

  useDidMountEffect(() => {
    if (status === 'success') {
      setRequests(groupPermissionRequests(data));
    } else {
      console.log(data, error);
    }
  }, [status]);

  return (
    <AuthLayout>
      {status === 'error' && error ? (
        <NotificationMessage severity={'error'} message={formatAxiosError(error)} />
      ) : (
        // <EditTable
        //   canSave={true}
        //   hideSave={true}
        //   columns={[]}
        //   data={requests as unknown[]}
        //   headers={[]}
        //   onSave={null}
        //   onRowModified={null}
        //   hideAdd={true}
        //   hideDelete={true}
        //   hideDuplicate={true}
        // />
        <ul>
          {requests.map((g) => (
            <li>request id: {g.id} animal ID: {g.requests.map(p => p.animal_id)} </li>
          ))}
        </ul>
      )}
    </AuthLayout>
  );
}
