import DataTable from 'components/table/DataTable';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { Collar } from 'types/collar';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { Box } from '@mui/material';
import DateInput from 'components/form/Date';
import { InboundObj, parseFormChangeResult } from 'types/form_types';
import { Button } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { formatDay } from 'utils/time';
import { FetchTelemetryInput } from 'types/events/vendor';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { isDev } from 'api/api_helpers';

/**
 */
export default function VendorAPIPage(): JSX.Element {
  const api = useTelemetryApi();
  const showAlert = useResponseDispatch();
  const startDate = isDev() ? dayjs().subtract(1, 'month') : dayjs().subtract(1, 'year');

  const [showConfirmFetch, setShowConfirmFetch] = useState(false);
  const [start, setStart] = useState<Dayjs>(startDate);
  const [end, setEnd] = useState<Dayjs>(dayjs());
  const [devices, setDevices] = useState<number[]>([]);

  const handleSelectRow = (rows: Collar[]): void => {
    const ids = rows.map((r) => r.device_id);
    setDevices(ids);
  };

  const handleChangeDate = (v: InboundObj): void => {
    const [key, value] = parseFormChangeResult(v);
    key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
  };

  const onError = (e: AxiosError): void => {
    showAlert({severity: 'error', message: formatAxiosError(e)});
  };

  const { mutateAsync, status } = api.useTriggerVendorTelemetry({ onError });

  useDidMountEffect(() => {
    // console.log('fetching status: ', status)
    if (status === 'loading') {
      showAlert({severity: 'info', message: 'Vendor telemetry fetch has begun. This could take a while'})
    } else if (status === 'success') {
      showAlert({severity: 'success', message: 'records were successfully fetched'});
    }
  }, [status])

  const performFetchVendorTelemetry = (): void => {
    const body: FetchTelemetryInput = {
      start: start.format(formatDay),
      end: end.format(formatDay),
      ids: devices
    };
    mutateAsync(body);
    setShowConfirmFetch(false);
  };

  return (
    <AuthLayout>
      <div className='container'>
        <Box mb={2}>
          <h4>Select the date range you wish to retrieve telemetry for</h4>
          <DateInput propName='tstart' label={'Start'} defaultValue={start} changeHandler={handleChangeDate} />
          <DateInput propName='tend' label={'End'} defaultValue={end} changeHandler={handleChangeDate} />
        </Box>
        <DataTable<Collar>
          headers={['device_id', 'device_make', 'frequency', 'device_model', 'device_status']}
          title='Vectronic Devices'
          queryProps={{ query: api.useUnattachedDevices, param: { keys: 'device_make', term: 'vectronic' } }}
          onSelectMultiple={handleSelectRow}
          isMultiSelect={true}
        />
        <Box>
          <p>Devices selected: {devices.length ? devices.join(', ') : 'none'}</p>
        </Box>
        <Box>
          <Button disabled={!devices.length} onClick={(): void => setShowConfirmFetch((o) => !o)}>
            Fetch Telemetry
          </Button>
        </Box>

        <ConfirmModal
          handleClickYes={performFetchVendorTelemetry}
          open={showConfirmFetch}
          handleClose={(): void => setShowConfirmFetch(false)}
          message={'are you sure you wish to manually trigger fetching of telemetry for these devices?'}
        />
      </div>
    </AuthLayout>
  );
}
