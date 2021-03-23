import { ExportImportProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import download from 'downloadjs';
import { eExportType, exportQueryParams } from 'types/export';
import { CircularProgress } from '@material-ui/core';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { formatAxiosError } from 'utils/common';

type ImportProps<T> = ExportImportProps & {
  critter_ids: string[];
  collar_ids: string[];
};

export default function Export<T>({ open, handleClose, critter_ids, collar_ids }: ImportProps<T>): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [exportType, setExportType] = useState<eExportType>(null);
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data): void => {
    if (data && data.length) {
      let filename = '';
      switch (exportType) {
        case eExportType.animal:
          filename = 'critter_history.json';
          break;
        case eExportType.collar:
          filename = 'collar_history.json';
          break;
        case eExportType.movement:
          filename = 'critter_movement_history.json';
          break;
      }
      download(JSON.stringify(data), filename, 'application/json');
    }
    reset();
  };

  const onError = (err): void => {
    responseDispatch({
      type: 'error',
      message: formatAxiosError(err)
    });
  };

  const { mutateAsync, reset, isLoading } = bctwApi.useExport({ onSuccess, onError });

  useEffect(() => {
    const fetchExportData = async (): Promise<void> => {
      if (exportType) {
        const body: exportQueryParams = {
          id: exportType === eExportType.collar ? collar_ids : critter_ids,
          type: exportType
        };
        mutateAsync(body);
      }
    };
    fetchExportData();
  }, [exportType]);

  return (
    <Modal open={open} handleClose={handleClose} title={'Export'}>
      <>
        {isLoading ? <CircularProgress /> : null}
        <p>What would you like to export?</p>
        <Button onClick={(): void => setExportType(eExportType.animal)} color='primary' variant='outlined'>
          Animal History
        </Button>
        <Button onClick={(): void => setExportType(eExportType.collar)} color='primary' variant='outlined'>
          Collar History
        </Button>
        <Button onClick={(): void => setExportType(eExportType.movement)} color='primary' variant='outlined'>
          Movement History
        </Button>
        <div>
          <ul>
            {critter_ids.map((i, idx) => (
              <li key={idx}>
                critter: {i} collar: {collar_ids[idx]}
              </li>
            ))}
          </ul>
        </div>
      </>
    </Modal>
  );
}
