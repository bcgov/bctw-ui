import { ModalBaseProps } from "components/component_interfaces";
import { Box, CircularProgress } from "@mui/material";
import { Modal, Button } from 'components/common';
import { IFormRowEntry, DateRange, TabNames } from "./ExportV2";
import download from "downloadjs";
import { omitNull } from "utils/common_helpers";
import { useTelemetryApi } from "hooks/useTelemetryApi";
import tokml from 'tokml';
import dayjs from "dayjs";
import { formatDay } from "utils/time";
import { useEffect, useRef, useState } from "react";
import { AttachedAnimal } from "types/animal";
import { LoadingButton } from "@mui/lab";
import makeStyles from '@mui/styles/makeStyles';
import useDidMountEffect from "hooks/useDidMountEffect";

type ExportModalProps = ModalBaseProps & {
    rowEntries: IFormRowEntry[];
    range: DateRange;
    exportType: TabNames;
    collarIDs: AttachedAnimal[];
    children?: React.ReactNode;
}

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
    }
  }));

export default function ExportDownloadModal({open, handleClose, rowEntries, range, exportType, collarIDs}: ExportModalProps): JSX.Element {
    const api = useTelemetryApi();
    const [downloadType, setDownloadType] = useState({downloadType: ''});
    const styles = useStyle();
    //Duplicate from MapExport.tsx, so should probably be yanked out and imported from elsewhere-----------
    const formatResultAsCSV = (data: unknown[]): string => {
        const headers = Object.keys(data[0]).join();
        const values = data.map(d => Object.values(d).join()).join('\n'); 
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
    //-----------------------------------------------------------------------------------------------------

    const onSuccessExport = (data): void => {
        if(data && data.length) {
            console.log("Read this download type: " + downloadType.downloadType);
            if(downloadType.downloadType == DownloadType.csv) {
                const formatData = data.map((o) => {
                    o.geom_x = o.geom?.coordinates[0]; 
                    o.geom_y = o.geom?.coordinates[1];
                    delete o.geom;
                    return o;
                });
                const result = formatResultAsCSV(formatData);
                const filename = 'telemetry_export.csv';
                download(result, filename); 
            }
            else {
                const result = formatResultAsKML(data);
                const filename = 'telemetry_export.kml';
                download(result, filename, 'application/xml'); 
            }
        }
    }

    const onErrorExportAll = (err): void => {
        console.log(err);
    }

    const onErrorExport = (err): void => {
        console.log(err);
    }

    const operatorTranslation = (operatorWord: string): string => {
        switch(operatorWord) {
            case "Equals":
                return "=";
            case "Not Equals":
                return "<>";
            default:
                return "";
        }
    }

    const didMount = useRef(false);

    useDidMountEffect(() => {
        /*if ( !didMount.current ) {
            didMount.current = true;
            return;
        }*/
        startRequest();
    }, [downloadType]);

    const {mutateAsync: mutateExportAll, reset: resetExportAll, isLoading: loadingExportAll } = api.useExportAll({onSuccess: onSuccessExport, onError: onErrorExportAll});
    const {mutateAsync: mutateExport, reset: resetExport, isLoading: loadingExport} = api.useExport({onSuccess: onSuccessExport, onError: onErrorExport});
    
    const handleAdvancedExport = (): void => {
        const body = {queries: [], range: {}};
        for(const row of rowEntries) {
            body.queries.push({
                key: row.column,
                operator: operatorTranslation(row.operator),
                term: row.value.map(o => o.toString().toLowerCase())
            });
        }
        body.range = {
            start: range.start.format(formatDay),
            end: range.end.format(formatDay)
        }
        console.log("Sending this body: " + body);
        mutateExportAll(body);
    }

    const handleSimpleExport = (): void => {
        const body = {
            collar_ids: collarIDs,
            type: 'movement',
            range: {
                start: range.start.format(formatDay),
                end: range.end.format(formatDay)
            }
        }
        console.log("Sending this body: " + body);
        mutateExport(body);
    }

    const startRequest = (): void => {
        if(exportType == TabNames.advanced) {
            handleAdvancedExport();
        }
        else {
            handleSimpleExport();
        }
    }

    const handleCSVClick = (): void => {
        setDownloadType({downloadType: DownloadType.csv});
        //startRequest();
    }

    const handleKMLClick = (): void => {
        setDownloadType({downloadType: DownloadType.kml});
        //console.log("KML click!");
        //startRequest();
    }
    
    return (
        <Modal open={open} handleClose={handleClose} title={'Confirm Export Download'}>
            <Box px={5} py={2} style={{backgroundColor: '#fff'}}>
                <Box display={'flex'} columnGap={2}>
                    <LoadingButton 
                    variant='contained'
                    loading={loadingExport || loadingExportAll}
                    disabled={loadingExport || loadingExportAll}
                    loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />} 
                    onClick={() => handleCSVClick() }>
                        Export Data as CSV
                    </LoadingButton>
                    <LoadingButton variant='contained'
                    loading={loadingExport || loadingExportAll}
                    disabled={loadingExport || loadingExportAll}
                    loadingIndicator={<CircularProgress className={styles.MuiCircularProgress} color='inherit' size={16} />} 
                    onClick={() => handleKMLClick() }>Export Data as KML</LoadingButton>
                </Box>
            </Box>
        </Modal>
    )
}