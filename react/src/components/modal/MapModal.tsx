import { Box, CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';
import dayjs, { Dayjs } from 'dayjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import * as L from 'leaflet'; // must be imported first
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'pages/map/MapPage.scss';
import { splitPings } from 'pages/map/map_helpers';
import { hidePopup, initMap, setPopupInnerHTML } from 'pages/map/map_init';
import { getStyle, setupLatestPingOptions, setupPingOptions, setupTracksOptions } from 'pages/map/point_setup';
import { useEffect, useRef, useState } from 'react';
import { ITelemetryPoint } from 'types/map';
import { formatDay } from 'utils/time';

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
  startDate = dayjs().subtract(24, 'weeks'),
  endDate = dayjs()
}: MapModalProps): JSX.Element {
  const mapRef = useRef<L.Map>(null);
  const api = useTelemetryApi();
  const drawnItems = new L.FeatureGroup();

  const [latestPings, setLatestPings] = useState<ITelemetryPoint[]>([]);
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());
  const [mapWasLoaded, setMapWasLoaded] = useState(false);

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
    if (pings.length) {
      const coord = pings[0]?.geometry.coordinates;
      if (coord?.length >= 2) {
        mapRef.current?.flyTo([coord[1], coord[0]], 8);
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setMapWasLoaded(false);
    }
  }, [open]);

  const updateComponent = (): void => {
    if (document.getElementById('map')) {
      mapRef.current?.removeLayer(tracksLayer);
      mapRef.current?.removeLayer(latestPingsLayer);
      mapRef.current?.removeLayer(pingsLayer);

      const drawOptions: L.Control.DrawOptions = {
        marker: false,
        circle: false,
        circlemarker: false,
        polygon: false,
        polyline: false,
        rectangle: false
      };

      initMap(
        mapRef,
        drawnItems,
        // new L.GeoJSON(),
        () => {},
        () => {},
        () => {},
        () => {},
        drawOptions,
        true
      );

      tracksLayer.addTo(mapRef.current);
      latestPingsLayer.addTo(mapRef.current);
      pingsLayer.addTo(mapRef.current);

      if (fetchingPings || fetchingTracks) {
        pingsLayer.clearLayers();
        latestPingsLayer.clearLayers();
        tracksLayer.clearLayers();
      } else {
        flyToLatestPings(latestPings);
      }
      setMapWasLoaded(true);
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
      if (fetchedPings && !isErrorPings && critter_id && mapWasLoaded) {
        pingsLayer.clearLayers();
        latestPingsLayer.clearLayers();
        setupPingOptions(pingsLayer, handlePointClick, handlePointClose);
        setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose);

        const crittersPings = fetchedPings;
        const { latest, other } = splitPings(crittersPings);
        setLatestPings(latest);
        pingsLayer.addData(other as any);
        latestPingsLayer.addData(latest as any);

        flyToLatestPings(latest);

        latestPingsLayer.bringToFront();
        tracksLayer.bringToBack();
      }
    };
    update();
  }, [fetchedPings, mapWasLoaded]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks && critter_id && mapWasLoaded) {
      tracksLayer.clearLayers();
      setupTracksOptions(tracksLayer);
      const crittersTracks = fetchedTracks;
      tracksLayer.addData(crittersTracks as any);
      latestPingsLayer.bringToFront();
      tracksLayer.bringToBack();
    }
  }, [fetchedTracks, mapWasLoaded]);

  const classes = modalStyles();
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      onEnteredCallback={() => {
        updateComponent();
      }}>
      <Box width={width} height={height}>
        <div className='map-container'>
          {fetchingPings || fetchingTracks ? <CircularProgress className={styles.progress} color='secondary' /> : null}
          <div id='popup' style={{ bottom: '-' + height }} />
          <div style={{ height: height }} id='map'></div>
        </div>
      </Box>
    </Modal>
  );
}
