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
import { Button, List } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { formatDay } from 'utils/time';
import { FetchTelemetryInput, ResponseTelemetry } from 'types/events/vendor';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { isDev } from 'api/api_helpers';

/**
 * allows an admin to manually trigger a Vectronic API fetch for raw telemetry
 * note: the materialized view is NOT rrefreshed
 * the datatable only fetches unattached devices
 */
export default function VendorAPIPage(): JSX.Element {
  const api = useTelemetryApi();
  const showAlert = useResponseDispatch();
  const startDate = isDev() ? dayjs().subtract(1, 'month') : dayjs().subtract(1, 'year');
  const [results, setResults] = useState<ResponseTelemetry[]>([]);

  const [showConfirmFetch, setShowConfirmFetch] = useState(false);
  const [start, setStart] = useState<Dayjs>(startDate);
  const [end, setEnd] = useState<Dayjs>(dayjs());
  const [devices, setDevices] = useState<number[]>([]);

  const [startTime, setStartTime] = useState<Dayjs | null>();
  const [endTime, setEndTime] = useState<Dayjs | null>();

  const handleSelectRow = (rows: Collar[]): void => {
    const ids = rows.map((r) => r.device_id);
    setDevices(ids);
  };

  const handleChangeDate = (v: InboundObj): void => {
    const [key, value] = parseFormChangeResult(v);
    key === 'tstart' ? setStart(dayjs(String(value))) : setEnd(dayjs(String(value)));
  };

  const onError = (e: AxiosError): void => {
    showAlert({ severity: 'error', message: formatAxiosError(e) });
  };

  const onSuccess = (rows: ResponseTelemetry[]): void => {
    setEndTime(dayjs());
    setResults(rows);
  };

  const { mutateAsync, status } = api.useTriggerVendorTelemetry({ onSuccess, onError });

  useDidMountEffect(() => {
    if (status === 'loading') {
      showAlert({ severity: 'info', message: 'Vendor telemetry fetch has begun. This could take a while...' });
    } else if (status === 'success') {
      showAlert({ severity: 'success', message: 'records were successfully fetched' });
    }
  }, [status]);

  const performFetchVendorTelemetry = (): void => {
    const body: FetchTelemetryInput = {
      start: start.format(formatDay),
      end: end.format(formatDay),
      ids: devices
    };
    setStartTime(dayjs());
    mutateAsync(body);
    setShowConfirmFetch(false);
  };

  const getTimeElapsed = (): string => {
    if (startTime?.isValid() && endTime?.isValid()) {
      const diff = endTime.diff(startTime, 's');
      return `fetched in ${diff} seconds`;
    }
    return `fetch time unavailable`;
  };

  return (
    <AuthLayout>
      <div className='container'>
        <Box mb={2}>
          <h4>Select the date range you wish to retrieve telemetry for</h4>
          <DateInput propName='tstart' label={'Start'} defaultValue={start} changeHandler={handleChangeDate} />
          <DateInput propName='tend' label={'End'} defaultValue={end} changeHandler={handleChangeDate} />
        </Box>
        <Box mb={2} display='flex' flexDirection='row' alignItems='center' columnGap={2}>
          <Button disabled={!devices.length} onClick={(): void => setShowConfirmFetch((o) => !o)}>
            Fetch Telemetry
          </Button>
          <span>Devices selected: {devices.length ? devices.join(', ') : 'none'}</span>
        </Box>
        <DataTable<Collar>
          headers={['device_id', 'device_make', 'frequency', 'device_model', 'device_status']}
          title='Vectronic Devices'
          queryProps={{ query: api.useUnattachedDevices, param: { keys: 'device_make', term: 'vectronic' } }}
          onSelectMultiple={handleSelectRow}
          isMultiSelect={true}
        />

        <Box>
          <h4>
            Results {status === 'loading' ? '(In progress...)' : status === 'success' ? `(${getTimeElapsed()})` : null}
          </h4>
          {results.length ? (
            <List values={results.map((l) => `${l.records_found} records found for device ${l.device_id}`)} />
          ) : null}
        </Box>

        <ConfirmModal
          handleClickYes={performFetchVendorTelemetry}
          open={showConfirmFetch}
          handleClose={(): void => setShowConfirmFetch(false)}
          message={'Are you sure you wish to manually fetch of telemetry for these devices?'}
        />
      </div>
    </AuthLayout>
  );
}
