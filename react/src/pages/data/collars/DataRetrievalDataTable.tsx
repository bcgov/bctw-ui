import { AxiosError } from 'axios';
import Icon from 'components/common/Icon';
import { ActionsMenu } from 'components/common/ActionsMenu';
import DataTable from 'components/table/DataTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { AttachedCollar, Collar } from 'types/collar';
import { ResponseTelemetry, TelemetryResultCounts } from 'types/events/vendor';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import { formatAxiosError } from 'utils/errors';
import { formatT } from 'utils/time';
import EditCollar from './EditCollar';
import ModifyCollarWrapper from './ModifyCollarWrapper';
export const DataRetrievalDataTable = (): JSX.Element => {
  const api = useTelemetryApi();
  const showAlert = useResponseDispatch();

  const [editObj, setEditObj] = useState<Collar | AttachedCollar>({} as Collar);
  const handleSelect = <T extends Collar>(row: T): void => setEditObj(row);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');

  const editProps = {
    editing: new Collar(),
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
  };

  const inverseEdit = (): void => {
    setOpenEdit((e) => !e);
  };

  const onSuccess = (rows: ResponseTelemetry[]): void => {
    const counts: TelemetryResultCounts = { found: 0, inserted: 0, errors: 0 };
    rows.forEach((row) => {
      counts.found += row.records_found ?? 0;
      counts.inserted += row.records_inserted ?? 0;
      counts.errors += !row.error ? 0 : 1;
    });
    if (counts.errors) {
      showAlert({
        severity: 'error',
        message: `Error: ${rows[0].error}`
      });
      return;
    }
    if (counts.inserted > 0) {
      showAlert({
        severity: 'info',
        message: `Found ${counts.found} records, inserted ${counts.inserted} new records.`
      });
    } else {
      showAlert({ severity: 'warning', message: 'No new telemetry found for this device.' });
    }
    //This might be an issue if the user selects another collar before the fetch completes.
    //Potentially will display an update of the wrong record in the UI.
    //The correct record would have been updated in the backend
    editObj.last_fetch_date = dayjs(rows[0].fetchDate);
    setUpdated(editObj.collar_id);
  };

  const onError = (e: AxiosError): void => {
    showAlert({ severity: 'error', message: formatAxiosError(e) });
  };

  const { mutateAsync, isSuccess, isLoading } = api.useTriggerVendorTelemetry({ onSuccess, onError });

  useDidMountEffect(() => {
    if (isLoading) {
      showAlert({ severity: 'info', message: 'Vendor telemetry fetch has begun. This could take a while...' });
    }
  }, [isSuccess, isLoading]);

  const Menu = (row: AttachedCollar, idx: number): JSX.Element => {
    const _edit = (): void => {
      inverseEdit();
    };
    const _update = (): void => {
      const payload = {
        start: formatT(dayjs()),
        end: editObj?.last_transmission_date.isValid() ? editObj?.last_transmission_date : formatT(dayjs().year(2015)),
        ids: [editObj.device_id],
        vendor: editObj.device_make
      };
      mutateAsync(payload);
    };
    const defaultItems = [
      {
        label: 'Edit',
        icon: <Icon icon={'edit'} />,
        handleClick: _edit
      },
      {
        label: 'Update Telemetry',
        icon: <Icon icon={'refresh'} />,
        handleClick: _update,
        disableMenuItem: !row?.last_fetch_date?.isValid()
      }
    ];
    return <ActionsMenu disabled={row !== editObj} menuItems={defaultItems} />;
  };

  return (
    <>
      <DataTable
        headers={AttachedCollar.dataRetrievalPropsToDisplay}
        title={'Data Retrieval'}
        queryProps={{ query: api.useAttachedDevices }}
        updated={updated}
        deleted={deleted}
        onSelect={handleSelect}
        customColumns={[{ column: Menu, header: <b>Actions</b> }]}
        paginationFooter
      />
      <ModifyCollarWrapper editing={editObj} onDelete={(collar_id: string): void => setDeleted(collar_id)}>
        <EditCollar {...editProps} open={openEdit} handleClose={inverseEdit} />
      </ModifyCollarWrapper>
    </>
  );
};
