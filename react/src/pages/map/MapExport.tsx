import { ModalBaseProps } from 'components/component_interfaces';
import { Modal, Button } from 'components/common';
import tokml from 'tokml';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import download from 'downloadjs';
import { eExportType, ExportQueryParams } from 'types/export';
import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { omitNull } from 'utils/common_helpers';
import { ITelemetryGroup, MapRange } from 'types/map';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatAxiosError } from 'utils/errors';

type ImportProps = ModalBaseProps & {
  groupedAssignedPings: ITelemetryGroup[];
  groupedUnassignedPings: ITelemetryGroup[];
  range: MapRange;
};

/**
 * exports telemetry and metadata
 * the map export options acessed from the map details component. Provides exports in two ways:
  1) export data from the selected timeline in the map filter panel. In this case, there is no
  round trip to the server as this telemetry is already accessible in memory
  2) all time data - uses the export API endpoint to retrieve data older than the currently
  selected window.
*/
export default function Export({ open, handleClose, groupedAssignedPings, range}: ImportProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [exportParams, setExportParams] = useState<{type: eExportType, timespan: 'all' | 'selected'}>(null);
  const responseDispatch = useResponseDispatch();

  const [critter_ids, setCritterIDs] = useState<string[]>([]);
  const [collar_ids, setCollarIDs] = useState<string[]>([])

  useDidMountEffect(() => {
    const critters = groupedAssignedPings.map(d => d.critter_id).filter(a => a);
    const collars = groupedAssignedPings.map(d => d.collar_id).filter(a => a);
    setCritterIDs(critters);
    setCollarIDs(collars);
  }, [groupedAssignedPings])

  useDidMountEffect(() => {
    const fetchExportData = async (): Promise<void> => {
      if (exportParams) {
        const { type, timespan } = exportParams; 

        const body: ExportQueryParams = {
          collar_ids,
          critter_ids,
          type,
        };
        if (timespan === 'selected') {
          body.range = range;
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
    const values = data.map(d => Object.values(d).join()).join('\n')
    const ret = `${headers}\n${values}`;
    return ret;
  }

  const formatResultAsKML = (data: Record<string, unknown>[][]): string => {
    const flattened: Record<string,unknown>[] = data.flatMap(d => omitNull(d));
    const asGeoJSON = flattened.map((d, i) => {
      const withoutGeom = Object.assign({}, d);
      // remove objects from the geojson feature.
      delete withoutGeom.geom;
      return { 
        type: 'Feature',
        id: i,
        geometry: d.geom,
        properties: withoutGeom 
      }
    })
    const ret = tokml({type: 'FeatureCollection', features: asGeoJSON})
    return ret;
  }

  // show notification when an error occurs
  const onError = (err): void => responseDispatch({severity: 'error', message: formatAxiosError(err)});

  // setup the API call 
  const { mutateAsync, reset, isLoading } = bctwApi.useExport({ onSuccess, onError });

  // when an export button is clicked, set the download state
  const clickExport = (type: eExportType, range: 'all' | 'selected'): void => {
    const n = {type, timespan: range};
    setExportParams(n)
  }

  const cellClass = 'cell-border-right';

  return (
    <Modal open={open} handleClose={handleClose} title={'Export'}>
      <>
        {isLoading ? <CircularProgress /> : null}
        <p>
          <b>{critter_ids.length}</b> unique {critter_ids.length == 1 ? 'animal' : 'animals'} selected.<br />
          <b>{collar_ids.length}</b> unique {collar_ids.length == 1 ? 'device' : 'devices'}  selected.<br />
        </p>
        <h4>Export history for:</h4>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={cellClass}><Typography style={{ fontWeight: 'bold' }}>{range.start} to {range.end}</Typography></TableCell>
                <TableCell><Typography style={{ fontWeight: 'bold' }}>All Time</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className={cellClass}>
                  <Button onClick={(): void => clickExport(eExportType.animal, 'selected')}>
                    Animal Metadata
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={(): void => clickExport(eExportType.animal, 'all')}>
                    Animal Metadata
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={cellClass}>
                  <Button onClick={(): void => clickExport(eExportType.collar, 'selected')}>
                    Device Metadata
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={(): void => clickExport(eExportType.collar, 'all')}>
                    Device Metadata
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={cellClass}>
                  <Button onClick={(): void => clickExport(eExportType.movement, 'selected')}>
                    Location Data
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={(): void => clickExport(eExportType.movement, 'all')}>
                    Location Data
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </>
    </Modal>
  );
}