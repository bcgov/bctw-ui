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
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());

  const {
    isFetching: fetchingPings,
    isLoading: isLoadingPings,
    isError: isErrorPings,
    data: fetchedPings
  } = api.usePings(days.format(formatDay), dayjs().format(formatDay));

  const { 
    isFetching: fetchingTracks, 
    isError: isErrorTracks, 
    data: fetchedTracks 
  } = api.useTracks(days.format(formatDay), dayjs().format(formatDay));

  const updateComponent = (): void => {
    if (document.getElementById('map')) {
      mapRef.current?.removeLayer(tracksLayer);
      mapRef.current?.removeLayer(latestPingsLayer);
      mapRef.current?.removeLayer(pingsLayer);
      initMap(mapRef, drawnItems, new L.GeoJSON, () => {}, () => {}, () => {});
      tracksLayer.addTo(mapRef.current);
      latestPingsLayer.addTo(mapRef.current);
      pingsLayer.addTo(mapRef.current);
      if(pings.length) {
        const coord = pings[0].geometry.coordinates;
        if(coord.length >= 2)
        {
          mapRef.current?.flyTo([coord[1], coord[0]], 8);
        }
        
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
      if (fetchedPings && !isErrorPings) {
        pingsLayer.clearLayers();
        latestPingsLayer.clearLayers();
        setupPingOptions(pingsLayer, handlePointClick,  handlePointClose);
        setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose);
        
        const crittersPings = fetchedPings.filter(p => p.properties.critter_id == critter_id);
        setPings(crittersPings);
        const { latest, other } = splitPings(crittersPings);
        pingsLayer.addData(other as any);
        latestPingsLayer.addData(latest as any);

        console.log("Here is how many latest we had " + latest.length);

        if(crittersPings.length) {
          const coord = crittersPings[0].geometry.coordinates;
          if(coord.length >= 2) {
            mapRef.current?.flyTo([coord[1], coord[0]], 8);
          }
            
        }
        latestPingsLayer.bringToFront();
        tracksLayer.bringToBack();
      }
    }
    update();
  }, [fetchedPings, critter_id]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      tracksLayer.clearLayers();
      setupTracksOptions(tracksLayer);
      const crittersTracks = fetchedTracks.filter(p => p.properties.critter_id == critter_id);
      tracksLayer.addData(crittersTracks as any);
      latestPingsLayer.bringToFront();
      tracksLayer.bringToBack();
    }
  }, [fetchedTracks, critter_id]);

  const classes = modalStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title} onEnteredCallback={() => {updateComponent()}}>
        <Box width={'800px'} height={'600px'}>
            <div style={{flex:'1 1 auto', position: 'relative'}}>
                <div id='popup'/>
                <div style={{height: '600px'}} id='map'></div>
            </div>
        </Box>
    </Modal>
  );
}