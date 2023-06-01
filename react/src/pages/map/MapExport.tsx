import { ModalBaseProps } from 'components/component_interfaces';
import { Modal, Button, Tooltip } from 'components/common';
import tokml from 'tokml';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import download from 'downloadjs';
import { eExportType, ExportQueryParams } from 'types/export';
import { Box, CircularProgress } from '@mui/material';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { omitNull } from 'utils/common_helpers';
import { ITelemetryGroup, MapRange } from 'types/map';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';
import DateInput from 'components/form/Date';
import dayjs, { Dayjs } from 'dayjs';
import { MapStrings } from 'constants/strings';
import { formatDay } from 'utils/time';
import { InboundObj, parseFormChangeResult } from 'types/form_types';

type ImportProps = ModalBaseProps & {
  groupedAssignedPings: ITelemetryGroup[];
  groupedUnassignedPings: ITelemetryGroup[];
  range: MapRange;
};

type ExportRange = 'all' | 'selected';

/**
 * exports telemetry and metadata
 * the map export options acessed from the map details component. Provides exports in two ways:
  1) export data from the selected timeline in the map filter panel. In this case, there is no
  round trip to the server as this telemetry is already accessible in memory
  2) all time data - uses the export API endpoint to retrieve data older than the currently
  selected window.
*/
export default function Export({ open, handleClose, groupedAssignedPings, range }: ImportProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [exportParams, setExportParams] = useState<{ type: eExportType; timespan: ExportRange }>(null);
  const [critter_ids, setCritterIDs] = useState<string[]>([]);
  const [collar_ids, setCollarIDs] = useState<string[]>([]);
  const [start, setStart] = useState<Dayjs>(dayjs(range.start));
  const [end, setEnd] = useState<Dayjs>(dayjs(range.end));
  const [rangeType, setRangeType] = useState<ExportRange>('selected');

  useDidMountEffect(() => {
    const critters = groupedAssignedPings.map((d) => d.critter_id).filter((a) => a);
    const collars = groupedAssignedPings.map((d) => d.collar_id).filter((a) => a);
    setCritterIDs(critters);
    setCollarIDs(collars);
  }, [groupedAssignedPings]);

  // when the export state changes, fetch the data to be exported
  useDidMountEffect(() => {
    const fetchExportData = async (): Promise<void> => {
      if (exportParams) {
        const { type, timespan } = exportParams;

        const body: ExportQueryParams = {
          collar_ids,
          critter_ids,
          type
        };
        if (timespan === 'selected') {
          body.range = {
            start: start.format(formatDay),
            end: end.format(formatDay)
          };
        }
        mutateAsync(body);
      }
    };
    fetchExportData();
  }, [exportParams]);

  // when the API sucessfully retrieves export data, format it and download
  const onSuccess = (data): void => {
    if (data && data.length) {
      let filename = '';
      let result = '';
      let type = '';
      switch (exportParams.type) {
        case eExportType.animal:
          filename = 'animal_history.csv';
          result = formatResultAsCSV(data);
          break;
        case eExportType.collar:
          filename = 'collar_history.csv';
          result = formatResultAsCSV(data);
          break;
        case eExportType.movement:
          filename = 'movement_history.kml';
          result = formatResultAsKML(data);
          type = 'application/xml';
          break;
      }
      download(result, filename, type);
    }
    reset();
  };

  const formatResultAsCSV = (data: unknown[]): string => {
    const headers = Object.keys(data[0]).join();
    const values = data.map((d) => Object.values(d).join()).join('\n');
    const ret = `${headers}\n${values}`;
    return ret;
  };

  const formatResultAsKML = (data: Record<string, unknown>[][]): string => {
    const flattened: Record<string, unknown>[] = data.flatMap((d) => omitNull(d));
    const asGeoJSON = flattened.map((d, i) => {
      const withoutGeom = Object.assign({}, d);
      // remove objects from the geojson feature.
      delete withoutGeom.geom;
      return {
        type: 'Feature',
        id: i,
        geometry: d.geom,
        properties: withoutGeom
      };
    });
    const ret = tokml({ type: 'FeatureCollection', features: asGeoJSON });
    return ret;
  };

  // show notification when an error occurs
  const onError = (err): void => showNotif({ severity: 'error', message: formatAxiosError(err) });

  // setup the API call
  const { mutateAsync, reset, isLoading } = api.useExport({ onSuccess, onError });

  // when an export button is clicked, set the download state
  const clickExport = (type: eExportType): void => setExportParams({ type, timespan: rangeType });

  const handleChangeRange = (v: InboundObj): void => {
    setRangeType('selected');
    const [key, value] = parseFormChangeResult(v);
    const val = String(value);
    if (key === 'tstart') {
      setStart(dayjs(val));
    } else {
      setEnd(dayjs(val));
    }
  };

  return (
    <Modal open={open} handleClose={handleClose} title={'Export'}>
      <Box px={5} py={2} style={{ backgroundColor: '#fff' }}>
        {isLoading ? <CircularProgress /> : null}
        <p>
          <b>{critter_ids.length}</b> unique {critter_ids.length == 1 ? 'animal' : 'animals'} selected.
          <br />
          <b>{collar_ids.length}</b> unique {collar_ids.length == 1 ? 'device' : 'devices'} selected.
          <br />
        </p>
        <h3>
          Export history{' '}
          {rangeType === 'selected' ? `from ${start.format(formatDay)} to ${end.format(formatDay)}` : 'for all time'}
        </h3>

        <Box display='flex' columnGap={3} mb={5} alignItems={'center'}>
          <Box width={'50%'} display={'flex'} flexDirection={'column'} rowGap={2}>
            <DateInput
              propName='tstart'
              label={MapStrings.startDateLabel}
              defaultValue={start}
              changeHandler={handleChangeRange}
              maxDate={end}
            />
            <DateInput
              propName='tend'
              label={MapStrings.endDateLabel}
              defaultValue={end}
              changeHandler={handleChangeRange}
              minDate={start}
            />
          </Box>
          <Box>
            <b>— or —</b>
          </Box>
          <Tooltip title={MapStrings.export.allTime}>
            <Button variant='outlined' onClick={(): void => setRangeType('all')}>
              All Time
            </Button>
          </Tooltip>
        </Box>
        <hr />
        <h3>Download</h3>
        <Box display={'flex'} columnGap={2}>
          <Button onClick={(): void => clickExport(eExportType.animal)}>Critter Metadata</Button>
          <Button onClick={(): void => clickExport(eExportType.collar)}>Device Metadata</Button>
          <Button onClick={(): void => clickExport(eExportType.movement)}>Location Data</Button>
        </Box>
      </Box>
    </Modal>
  );
}
