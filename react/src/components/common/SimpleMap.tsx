import { Box, CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import dayjs, { Dayjs } from 'dayjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { getFillColorByDeviceStatus, splitPings, voidFunc } from 'pages/map/map_helpers';
import { hidePopup, initMap, setPopupInnerHTML } from 'pages/map/map_init';
import { getStyle, setupLatestPingOptions, setupPingOptions, setupTracksOptions } from 'pages/map/point_setup';
import { useEffect, useRef, useState } from 'react';
import { ITelemetryPoint } from 'types/map';
import { formatDay } from 'utils/time';

interface SimpleMapProps {
  critter_id?: string;
  height: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  divID?: string;
  width?: string;
}

const useStyles = makeStyles((theme) => ({
  progress: {
    position: 'absolute',
    zIndex: 1000,
    marginTop: '30px'
  }
}));

export default function SimpleMap({
  critter_id,
  height,
  startDate,
  endDate,
  divID,
  width
}: SimpleMapProps): JSX.Element {
  //const [detailAnimal, setDetailAnimal] = useState<string>(animal);
  const DIV_ID = divID ?? 'map';
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
    isError: isErrorPings,
    data: fetchedPings
  } = api.usePingsPerCritter(
    startDate.isValid() ? startDate.format(formatDay) : '1980-01-01', //detailAnimal?.attachment_start ? detailAnimal.attachment_start.format(formatDay) : null,
    endDate.isValid() ? endDate.format(formatDay) : dayjs().format(formatDay), //detailAnimal?.attachment_end ? detailAnimal.attachment_end.format(formatDay) : null,
    critter_id,
    critter_id !== null
  );

  const {
    isFetching: fetchingTracks,
    isError: isErrorTracks,
    data: fetchedTracks
  } = api.useTracksPerCritter(
    startDate.isValid() ? startDate.format(formatDay) : '1980-01-01', //detailAnimal?.attachment_start ? detailAnimal.attachment_start.format(formatDay) : null,
    endDate.isValid() ? endDate.format(formatDay) : dayjs().format(formatDay), //detailAnimal?.attachment_end ? detailAnimal.attachment_end.format(formatDay) : null,
    critter_id,
    critter_id !== null
  );

  const flyToLatestPings = (pings: ITelemetryPoint[]) => {
    if (pings.length) {
      const coord = pings[0]?.geometry.coordinates;
      if (coord?.length >= 2) {
        mapRef.current?.flyTo([coord[1], coord[0]], 8);
      }
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
        setupPingOptions(pingsLayer, handlePointClick, handlePointClose, getFillColorByDeviceStatus);
        setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose, getFillColorByDeviceStatus);

        const crittersPings = fetchedPings;
        const { latest, other } = splitPings(crittersPings);
        setLatestPings(latest);
        pingsLayer.addData(other as unknown as GeoJSON.GeoJsonObject);
        latestPingsLayer.addData(latest as unknown as GeoJSON.GeoJsonObject);

        flyToLatestPings(latest);

        latestPingsLayer.bringToFront();
        tracksLayer.bringToBack();
      }
    };

    update();
  }, [fetchedPings]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks && critter_id) {
      tracksLayer.clearLayers();
      setupTracksOptions(tracksLayer);
      const crittersTracks = fetchedTracks;
      tracksLayer.addData(crittersTracks as unknown as GeoJSON.GeoJsonObject);
      latestPingsLayer.bringToFront();
      tracksLayer.bringToBack();
    }
  }, [fetchedTracks]);

  useEffect(() => {
    const updateComponent = (): void => {
      if (document.getElementById(DIV_ID)) {
        mapRef.current?.removeLayer(tracksLayer);
        mapRef.current?.removeLayer(latestPingsLayer);
        mapRef.current?.removeLayer(pingsLayer);

        const drawOptions: L.Control.DrawOptions = {
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false
        };
        initMap(
          mapRef,
          drawnItems,
          // new L.GeoJSON(),
          voidFunc,
          voidFunc,
          voidFunc,
          voidFunc,
          drawOptions,
          true,
          DIV_ID
        );

        tracksLayer.addTo(mapRef.current);
        latestPingsLayer.addTo(mapRef.current);
        pingsLayer.addTo(mapRef.current);

        if (latestPings) {
          flyToLatestPings(latestPings);
        }
      }
    };
    if (critter_id) {
      updateComponent();
    }
  }, [critter_id]);

  return (
    <Box height={height}>
      <div className='map-container'>
        {fetchingPings || fetchingTracks ? <CircularProgress className={styles.progress} color='secondary' /> : null}
        <div id='popup' style={{ bottom: '0px' }} />
        <div style={{ height: height, width: width ?? '100%' }} id={DIV_ID}></div>
      </div>
    </Box>
  );
}
