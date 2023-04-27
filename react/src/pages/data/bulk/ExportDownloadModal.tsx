import { INotificationMessage, ModalBaseProps } from 'components/component_interfaces';
import { Box, CircularProgress } from '@mui/material';
import { Icon, Modal } from 'components/common';
import { DateRange, ExportTab, TabNames } from './ExportV2';
import download from 'downloadjs';
import { omitNull } from 'utils/common_helpers';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import tokml from 'tokml';
import { formatDay } from 'utils/time';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import makeStyles from '@mui/styles/makeStyles';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { IFormRowEntry, QueryBuilderOperator } from 'components/form/QueryBuilder';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { ExportStrings as constants, ExportStrings } from 'constants/strings';
import { ExportAllParams } from 'types/export';

type ExportModalProps = ModalBaseProps & {
  rowEntries: IFormRowEntry[];
  range: DateRange;
  exportType: ExportTab;
  collarIDs: string[];
  postGISstrings?: string[];
  critterIDs?: string[];
  children?: React.ReactNode;
  lastTelemetryOnly: boolean;
  attachedOnly: boolean;
};

enum DownloadType {
  csv = 'csv',
  kml = 'kml'
}

const useStyle = makeStyles((theme) => ({
  MuiCircularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    height: '20px !important',
    width: '20px !important',
    marginLeft: '-17px',
    marginTop: '-10px'
  },
  loadingButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingButton: {
    minWidth: '190px'
  }
}));

/*
 * Download modal for use with the Export page.
 * Will query the export-all endpoint based on the rowEntries passed as props.
 * Will format the resultant response in either CSV or KML format.
 */
export default function ExportDownloadModal({
  open,
  handleClose,
  rowEntries,
  range,
  exportType,
  collarIDs,
  critterIDs,
  postGISstrings,
  lastTelemetryOnly,
  attachedOnly
}: ExportModalProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [downloadType, setDownloadType] = useState({ downloadType: '' });
  const styles = useStyle();
  const constants = ExportStrings.modal;
  //Duplicate from MapExport.tsx, so should probably be yanked out and imported from elsewhere-----------
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
  //-----------------------------------------------------------------------------------------------------

  const onSuccessExport = (data): void => {
    if (data && data.length) {
      const notif = { severity: 'success', message: constants.telemetrySuccessMsg } as INotificationMessage;
      showNotif(notif);

      if (downloadType.downloadType == DownloadType.csv) {
        const formatData = data.map((o) => {
          o.geom_x = o.geom?.coordinates[0];
          o.geom_y = o.geom?.coordinates[1];
          delete o.geom;
          return o;
        });
        const result = formatResultAsCSV(formatData);
        const filename = 'telemetry_export.csv';
        download(result, filename);
      } else {
        const result = formatResultAsKML(data);
        const filename = 'telemetry_export.kml';
        download(result, filename, 'application/xml');
      }
    } else {
      showNotif({ severity: 'warning', message: constants.noTelemetryWarning });
    }
    handleClose(false);
  };

  const onErrorExportAll = (err: AxiosError): void => {
    showNotif({ severity: 'error', message: formatAxiosError(err) });
    handleClose(false);
  };

  const operatorTranslation = (operatorWord: QueryBuilderOperator | ''): string => {
    switch (operatorWord) {
      case 'Equals':
        return '=';
      case 'Not Equals':
        return '<>';
      default:
        return '';
    }
  };

  useDidMountEffect(() => {
    startRequest();
  }, [downloadType]);

  const { mutateAsync: mutateExportAll, isLoading: loadingExportAll } = api.useExportAll({
    onSuccess: onSuccessExport,
    onError: onErrorExportAll
  });

  const handleAdvancedExport = (): void => {
    const body: ExportAllParams = { bctw_queries: [], range: {start: null, end: null}, polygons: [], lastTelemetryOnly: lastTelemetryOnly, attachedOnly: attachedOnly };
    const bctw_columns = ['device_id','frequency'];
    for (const row of rowEntries) {
      if(bctw_columns.includes(row.column)) {
        body.bctw_queries.push({
          key: row.column,
          operator: row.operator,
          term: row.value.map((o) => o.toString().toLowerCase().trim())
        })
      }
      else {
        body[row.column] = {body: row.value.map((o) => o.toString().toLowerCase().trim()), negate: row.operator === "Not Equals"}
      }
    }
    body.range = {
      start: range.start.format(formatDay),
      end: range.end.format(formatDay)
    };

    if (postGISstrings) {
      body.polygons = postGISstrings;
    }

    mutateExportAll(body);
  };

  const handleSimpleExport = (): void => {
    const body = { queries: [], range: {}, polygons: [], lastTelemetryOnly: lastTelemetryOnly, attachedOnly: false };
    body.queries = [{ key: 'critter_id', operator: '=', term: critterIDs }];
    body.range = {
      start: range.start.format(formatDay),
      end: range.end.format(formatDay)
    };
    body.polygons = [];
    mutateExportAll(body);
  };

  const startRequest = (): void => {
    if (exportType == 'Advanced Export') {
      handleAdvancedExport();
    } else {
      handleSimpleExport();
    }
  };

  const handleCSVClick = (): void => {
    setDownloadType({ downloadType: DownloadType.csv });
  };

  const handleKMLClick = (): void => {
    setDownloadType({ downloadType: DownloadType.kml });
  };

  return (
    <Modal open={open} handleClose={handleClose} title={constants.modalTitle}>
      <Box width={'500px'} px={5} py={2} style={{ backgroundColor: '#fff' }}>
        <Box className={styles.loadingButtonContainer} columnGap={2}>
          <LoadingButton
            variant='contained'
            className={styles.loadingButton}
            loading={loadingExportAll && downloadType.downloadType === 'csv'}
            disabled={loadingExportAll}
            endIcon={<Icon icon='arrow-down' />}
            loadingPosition='end'
            loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />}
            onClick={() => handleCSVClick()}>
            {loadingExportAll && downloadType.downloadType === 'csv' ? constants.csvButtonLoad : constants.csvButton}
          </LoadingButton>
          <LoadingButton
            variant='contained'
            className={styles.loadingButton}
            loadingPosition='end'
            loading={loadingExportAll && downloadType.downloadType === 'kml'}
            disabled={loadingExportAll}
            endIcon={<Icon icon='arrow-down' />}
            loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />}
            onClick={() => handleKMLClick()}>
            {loadingExportAll && downloadType.downloadType === 'kml' ? constants.kmlButtonLoad : constants.kmlButton}
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
}
