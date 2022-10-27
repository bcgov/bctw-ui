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
import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { hidePopup, initMap, setPopupInnerHTML } from 'pages/map/map_init';
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
import { splitPings } from 'pages/map/map_helpers';
import makeStyles from '@mui/styles/makeStyles';

/**
 * Props for a map modal that can display critter points and tracks.
 * @param width width of modal
 * @param height height of modal
 * @param critter_id this should be a uuid, queries will be made based off this value
 * @param startDate start of the range on which to query for points
 * @param endDate end of the range on which to query for points
 */
type MapModalProps = ModalBaseProps & {
  width: string;
  height: string;
  critter_id: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
};

const useStyles = makeStyles((theme) => ({
  progress: {
    position: 'absolute', 
    zIndex: 1000, 
    marginTop: '30px'
  }
}));

export default function MapModal({
  title,
  open,
  handleClose,
  critter_id,
  width,
  height,
  startDate = dayjs().subtract(2, 'weeks'),
  endDate = dayjs()
}: MapModalProps): JSX.Element {
  const mapRef = useRef<L.Map>(null);
  const api = useTelemetryApi();
  const drawnItems = new L.FeatureGroup();

  const [latestPings, setLatestPings] = useState<ITelemetryPoint[]>([]);
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());
  
  const styles = useStyles();

  const {
    isFetching: fetchingPings,
    isLoading: isLoadingPings,
    isError: isErrorPings,
    data: fetchedPings
  } = api.usePingsPerCritter(startDate.format(formatDay), endDate.format(formatDay), critter_id, open);

  const { 
    isFetching: fetchingTracks, 
    isError: isErrorTracks, 
    data: fetchedTracks 
  } = api.useTracksPerCritter(startDate.format(formatDay), endDate.format(formatDay), critter_id, open);

  const flyToLatestPings = (pings: ITelemetryPoint[]) => {
    if(pings.length) {
      const coord = pings[0]?.geometry.coordinates;
      if(coord?.length >= 2)
      {
        mapRef.current?.flyTo([coord[1], coord[0]], 8);
      }
    }
  }
  
  const updateComponent = (): void => {
    if (document.getElementById('map')) {

      mapRef.current?.removeLayer(tracksLayer);
      mapRef.current?.removeLayer(latestPingsLayer);
      mapRef.current?.removeLayer(pingsLayer);

      const drawOptions: L.Control.DrawOptions = { marker: false, circle: false, circlemarker: false, polygon: false, polyline: false, rectangle: false }
      
      initMap(mapRef, drawnItems, new L.GeoJSON, () => {}, () => {}, () => {}, () => {}, drawOptions, true);
      
      tracksLayer.addTo(mapRef.current);
      latestPingsLayer.addTo(mapRef.current);
      pingsLayer.addTo(mapRef.current);

      if(fetchingPings || fetchingTracks) {
        pingsLayer.clearLayers();
        latestPingsLayer.clearLayers();
        tracksLayer.clearLayers();
      }
      else {
        flyToLatestPings(latestPings);
      }
      console.log("Update component fires");
    }
  };

  const handlePointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    const feature: ITelemetryPoint = layer?.feature;
    setPopupInnerHTML(feature);
    event.target.prevStyle = getStyle(event);
  };

  const handlePointClose = (event: L.LeafletEvent): void => {
    hidePopup();
  };

  useEffect(() => {
    const update = (): void => {
      if (fetchedPings && !isErrorPings && critter_id) {
        pingsLayer.clearLayers();
        latestPingsLayer.clearLayers();
        setupPingOptions(pingsLayer, handlePointClick,  handlePointClose);
        setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose);
        
        const crittersPings = fetchedPings;

        const { latest, other } = splitPings(crittersPings);
        setLatestPings(latest);
        pingsLayer.addData(other as any);
        latestPingsLayer.addData(latest as any);

        console.log("Here is how many latest we had " + latest.length);

        flyToLatestPings(latest);

        latestPingsLayer.bringToFront();
        tracksLayer.bringToBack();
      }
    }
    update();
  }, [fetchedPings]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks && critter_id) {
      tracksLayer.clearLayers();
      setupTracksOptions(tracksLayer);
      const crittersTracks = fetchedTracks;
      tracksLayer.addData(crittersTracks as any);
      latestPingsLayer.bringToFront();
      tracksLayer.bringToBack();
    }
  }, [fetchedTracks]);

  const classes = modalStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title} onEnteredCallback={() => {updateComponent()}}>
        <Box width={width} height={height}>
            <div className='map-container'>
                {fetchingPings || fetchingTracks ? <CircularProgress className={styles.progress} color='secondary' /> : null}
                <div id='popup' style={{bottom: '-'+height}}/>
                <div style={{height: height}} id='map'></div>
                
            </div>
        </Box>
    </Modal>
  );
}