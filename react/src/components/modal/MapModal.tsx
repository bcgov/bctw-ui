import * as L from 'leaflet'; // must be imported first
import 'leaflet.markercluster';
import 'pages/map/MapPage.scss';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { ModalBaseProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';
import { Modal } from 'components/common';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { initMap } from 'pages/map/map_init';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import {
  defaultPointStyle,
  getStyle,
  highlightLatestPings,
  highlightPings,
  selectedPointStyle,
  setupLatestPingOptions,
  setupPingOptions,
  setupSelectedPings,
  setupTracksOptions,
  symbolizePings
} from 'pages/map/point_setup';
import { ITelemetryPoint } from 'types/map';
import { formatDay, getToday } from 'utils/time';

/**
 * props for the simple yes/no style confirmation modal
 * @param btnNoText text to display in the 'no' button
 * @param message either a string or component to display as the main content of the modal
 * @param handleClickYes called when 'yes' is clicked
 */
type MapModalProps = ModalBaseProps & {
  critter_id: string;
  days: Dayjs;
};

export default function MapModal({
  title,
  open,
  handleClose,
  critter_id,
  days
}: MapModalProps): JSX.Element {
  const mapRef = useRef<L.Map>(null);
  const api = useTelemetryApi();
  const drawnItems = new L.FeatureGroup();
  const drawnLines = [];
  const [pings, setPings] = useState<ITelemetryPoint[]>([]);
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks

  const {
    isFetching: fetchingPings,
    isLoading: isLoadingPings,
    isError: isErrorPings,
    data: fetchedPings
  } = api.usePings(dayjs().subtract(4, 'year').format(formatDay), dayjs().format(formatDay), 'f0dc2059-dc54-4ce2-8987-5f0e65bf807a');

  const { 
    isFetching: fetchingTracks, 
    isError: isErrorTracks, 
    data: fetchedTracks 
  } = api.useTracks(dayjs().subtract(4, 'year').format(formatDay), dayjs().format(formatDay), 'f0dc2059-dc54-4ce2-8987-5f0e65bf807a');

  const updateComponent = (): void => {
    if (document.getElementById('map')) {
      initMap(mapRef, drawnItems, new L.GeoJSON, () => {}, () => {}, () => {});
      pingsLayer.addTo(mapRef.current);
      tracksLayer.addTo(mapRef.current);
    }
  };

  useEffect(() => {
    const update = (): void => {
      if (fetchedPings && !isErrorPings) {
        // must be called before adding data to pings layer
        setupPingOptions(pingsLayer, () => {},  () => {});
        //setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose);
        // re-apply filters
        setPings(fetchedPings);
        pingsLayer.addData(fetchedPings as any);
      }
      
    }
    update();
  }, [fetchedPings]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      setupTracksOptions(tracksLayer);
      tracksLayer.addData(fetchedTracks as any);
    }
  }, [fetchedTracks]);

  const classes = modalStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title} onEnteredCallback={() => {updateComponent()}}>
        <Box width={'800px'} height={'600px'}>
            <div style={{flex:'1 1 auto', position: 'relative'}}>
                <div style={{height: '600px'}} id='map'></div>
            </div>
        </Box>
        {//<Button onClick={() => {updateComponent()}}>Click</Button>
        }
    </Modal>
  );
}