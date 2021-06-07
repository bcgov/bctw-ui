import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { PermissionRequest } from 'types/permission';

export default function AdminHandleRequestPermissionPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const tblProps:ITableQueryProps<PermissionRequest> = { query: bctwApi.usePermissionRequests
  }

  return (
    <AuthLayout>
      <DataTable queryProps={tblProps}/>
    </AuthLayout>
  );
}
