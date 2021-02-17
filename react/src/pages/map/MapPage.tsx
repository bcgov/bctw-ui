import * as L from 'leaflet'; // needs to be imported first?
import './MapPage.scss';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';

import { CircularProgress } from '@material-ui/core';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { PageProp } from 'components/component_interfaces';
import dayjs from 'dayjs';
import download from 'downloadjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import CreateMapSidebar from 'pages/map/CreateMapSidebar';
import { addTileLayers, setupPingOptions, setupSelectedPings } from 'pages/map/map_helpers';
import MapDetails from 'pages/map/MapDetails';
import { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { formatDay, getToday } from 'utils/time';
import { ITelemetryFeature } from 'types/map';

export default function MapPage(props: PageProp): JSX.Element {
  const {setSidebarContent} = props;
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Tracks
  const [pings] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Pings

  const [start, setStart] = useState<string>(dayjs().subtract(14, 'day').format(formatDay));
  const [end, setEnd] = useState<string>(getToday());

  const [selectedCollars, setSelectedCollars] = useState<ITelemetryFeature[]>([]);

  const drawnItems = new L.FeatureGroup(); // Store the selection shapes

  const { isFetching: fetchingTracks, isError: isErrorTracks, data: tracksData } = bctwApi.useTracks(start, end);
  const { isFetching: fetchingPings, isError: isErrorPings, data: pingsData } = bctwApi.usePings(start, end);
  // const { isError: isErrorLatestPings, data: latestPingsData } = (bctwApi.usePings as any)(start, end);

  useEffect(() => {
    drawLatestPings();
  }, [start, end]);

  useEffect(() => {
    if (tracksData && !isErrorTracks) {
      tracks.addData(tracksData as any);
    }
  }, [tracksData]);

  useEffect(() => {
    if (pingsData && !isErrorPings) {
      pings.addData(pingsData as any);
    }
  }, [pingsData]);

  const handleMapPointClick = (event): void => {
    const feature: ITelemetryFeature = event?.target?.feature;
    setSelectedCollars([feature]);
  };

  setupPingOptions(pings, handleMapPointClick);

  const selectedPings = new L.GeoJSON(); // Store the selected pings
  selectedPings.options = setupSelectedPings();

  //
  const displaySelectedUnits = (overlay: GeoJSON.FeatureCollection<GeoJSON.Point, { [name: string]: any }>): void => {
    const selectedCollars = overlay.features
      .map((f) => f.properties.device_id)
      .reduce((total, f) => {
        if (total.indexOf(f) >= 0) {
          return total;
        } else {
          return total.concat(f);
        }
      }, []);
    setSelectedCollars(selectedCollars);
  };

  //
  const drawSelectedLayer = (): void => {
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    // More typescript type definition bugs... These are the right features!!!
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);

    displaySelectedUnits(overlay);

    // Clear any previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        mapRef.current.removeLayer(layer);
      }
    });

    selectedPings.addData(overlay);
  };

  // redraw on updated start/end params
  const drawLatestPings = (): void => {
    console.log('drawing pings');
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pings);
    layerPicker.removeLayer(tracks);
    pings.clearLayers();
    tracks.clearLayers();
  };

  const initMap = (): void => {
    mapRef.current = L.map('map', { zoomControl: false }).setView([55, -128], 6);
    const layerPicker = L.control.layers();
    addTileLayers(mapRef, layerPicker);

    layerPicker.addOverlay(tracks, 'Critter Tracks');
    layerPicker.addOverlay(pings, 'Critter Locations');

    mapRef.current.addLayer(drawnItems);
    mapRef.current.addLayer(selectedPings);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    mapRef.current.addControl(drawControl);
    mapRef.current.addControl(layerPicker);

    // Set up the drawing events
    mapRef.current
      .on('draw:created', (e) => {
        drawnItems.addLayer((e as any).layer);
        drawSelectedLayer();
      })
      .on('draw:edited', (e) => {
        drawSelectedLayer();
      })
      .on('draw:deletestop', (e) => {
        drawSelectedLayer();
      });
  };

  const handlePickDate = (event): void => {
    const key = Object.keys(event)[0];
    if (key === 'tstart') {
      setStart(event[key]);
      return;
    }
    if (key == 'tend') {
      setEnd(event[key]);
    }
  };

  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap();
        CreateMapSidebar({ start, end, onChange: handlePickDate, setSidebarContent });
      }
    };
    updateComponent();
  });

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  }, [tracks]);

  // Add the ping layer
  useEffect(() => {
    pings.addTo(mapRef.current);
  }, [pings]);

  const handleKeyPress = (e) => {
    if (!(e.ctrlKey && e.keyCode == 83)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    let kml;
    if ((selectedPings as any).toGeoJSON().features.length > 0) {
      kml = tokml((selectedPings as any).toGeoJSON());
    } else {
      kml = tokml((pings as any).toGeoJSON());
    }
    download(kml, 'collars.kml', 'application/xml');
  };

  return (
    <div className={'map-view'}>
      <MapDetails selected={selectedCollars} />
      {fetchingPings || fetchingTracks ? <CircularProgress className='loading-data' color='secondary' /> : null}
      <div className={'map-container'}>
        <div id='map' onKeyDown={handleKeyPress}></div>
      </div>
    </div>
  );
}
