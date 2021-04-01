import { ExportImportProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import tokml from 'tokml';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import download from 'downloadjs';
import { eExportType, exportQueryParams } from 'types/export';
import { ButtonGroup, CircularProgress } from '@material-ui/core';
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
      let result = '';
      switch (exportType) {
        case eExportType.animal:
          filename = 'animal_history.csv';
          result = formatAsCSV(data);
          break;
        case eExportType.collar:
          filename = 'collar_history.csv';
          result = formatAsCSV(data);
          break;
        case eExportType.movement:
          filename = 'movement_history.kml';
          result = formatAsKML(data);
          break;
      }
      download(result, filename, '');
    }
    reset();
  };

  const formatAsCSV = (data: unknown[]): string => {
    const headers = Object.keys(data[0]).join();
    const values = data.map(d => Object.values(d).join()).join('\n')
    const ret = `${headers}\n${values}`;
    return ret;
  }

  const formatAsKML = (data: unknown[]): string => {
    const asGeoJSON = data.map((d, i) => {
      return { 
        type: 'Feature',
        id: i,
        geometry: (d as any).geom,
        properties: { device_id: (d as any).device_id, date_recorded: (d as any).date_recorded, vendor: (d as any).device_vendor }
      }
    })
    const ret = tokml({type: 'FeatureCollection', features: asGeoJSON})
    return ret;
  }

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
          ids: exportType === eExportType.collar ? collar_ids : critter_ids,
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
        <p>What would you like to export? {critter_ids.length} selected</p>
        <ButtonGroup >
          <Button onClick={(): void => setExportType(eExportType.animal)} color='primary' variant='outlined'>
            Animal History
          </Button>
          <Button onClick={(): void => setExportType(eExportType.collar)} color='primary' variant='outlined'>
            Device History
          </Button>
          <Button onClick={(): void => setExportType(eExportType.movement)} color='primary' variant='outlined'>
            Point/Location History
          </Button>
        </ButtonGroup>
        <div>
          {/* <ul>
            {critter_ids.map((i, idx) => (
              <li key={idx}>
                critter: {i} collar: {collar_ids[idx]}
              </li>
            ))}
          </ul> */}
        </div>
      </>
    </Modal>
  );
}
