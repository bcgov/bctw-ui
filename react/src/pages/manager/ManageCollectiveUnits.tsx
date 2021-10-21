import { List } from 'components/common';
import Button from 'components/form/Button';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import AddUDF from 'pages/udf/AddUDF';
import { useState } from 'react';
import { eUDFType, UDF } from 'types/udf';
import { eUserRole } from 'types/user';

export default function ManageCollectiveUnits(): JSX.Element {
  const api = useTelemetryApi();
  const [udfs, setUdfs] = useState<UDF[]>([]);
  const [showM, setShowM] = useState(false);

  // fetch UDFs for this user
  const { data, status } = api.useUDF(eUDFType.collective_unit);

  useDidMountEffect(() => {
    if (status === 'success') {
      setUdfs(data);
    }
  }, [data]);

  return (
    <AuthLayout required_user_role={eUserRole.manager}>
      <div>
        <h2>Your Collective Units</h2>
        {udfs?.length ? <List values={udfs.map((u) => String(u.value))} /> : null}
        <Button onClick={(): void => setShowM((o) => !o)}>add collective unit</Button>
      </div>
      <AddUDF
        title='Manage Collective Units'
        hideDelete={true}
        hideEdit={true}
        hideDuplicate={true}
        udf_type={eUDFType.collective_unit}
        open={showM}
        handleClose={(): void => setShowM(false)}
      />
    </AuthLayout>
  );
}
