import * as L from 'leaflet'; // needs to be imported first?
import './MapPage.scss';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';

import { CircularProgress } from '@material-ui/core';
import pointsWithinPolygon from '@turf/points-within-polygon';
import dayjs from 'dayjs';
import download from 'downloadjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { addTileLayers, COLORS, isMortality, setupPingOptions, setupSelectedPings } from 'pages/map/map_helpers';
import MapDetails from 'pages/map/details/MapDetails';
import { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { formatDay, getToday } from 'utils/time';
import { ITelemetryFeature, MapRange } from 'types/map';
import MapSidebarFilters from './MapSidebarFilters';
import DialogFullScreen from 'components/modal/DialogFullScreen';
import { ICodeFilter } from 'types/code';

export default function MapPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Tracks
  const [pings] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Pings

  const [range, setRange] = useState<MapRange>({ start: dayjs().subtract(14, 'day').format(formatDay), end: getToday()});

  const [features, setFeatures] = useState<ITelemetryFeature[]>([]);
  const [selectedFeatureIDs, setSelectedFeatureIDs] = useState<number[]>([]);

  const [showModal, setShowModal] = useState<boolean>(false);

  let previousLayer = null;

  const drawnItems = new L.FeatureGroup(); // Store the selection shapes

  const { isFetching: fetchingTracks, isError: isErrorTracks, data: tracksData } = bctwApi.useTracks(range.start, range.end);
  const { isFetching: fetchingPings, isError: isErrorPings, data: pingsData } = bctwApi.usePings(range.start, range.end);
  // const { isError: isErrorLatestPings, data: latestPingsData } = (bctwApi.usePings as any)(start, end);

  useEffect(() => {
    drawLatestPings();
  }, [range]);

  useEffect(() => {
    if (tracksData && !isErrorTracks) {
      tracks.addData(tracksData as any);
    }
  }, [tracksData]);

  useEffect(() => {
    if (pingsData && !isErrorPings) {
      pings.addData(pingsData as any);
      setFeatures(pingsData as any);
    }
  }, [pingsData]);

  const handleMapPointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    const feature: ITelemetryFeature = layer?.feature;
    // remove the highlight from the previous layer
    if (previousLayer && previousLayer.feature?.id !== feature.id) {
      previousLayer.setStyle({
        weight: 1.0,
        fillColor: isMortality(previousLayer.feature) ? COLORS.dead : COLORS.normal
      });
    }
    layer.setStyle({ weight: 3.0, fillColor: COLORS.selected });
    previousLayer = layer;
    // setSelectedFeatureIDs([feature.id as number]);
  };

  setupPingOptions(pings, handleMapPointClick);

  const selectedPings = new L.GeoJSON(); // Store the selected pings
  selectedPings.options = setupSelectedPings();

  //
  const displaySelectedUnits = (overlay: GeoJSON.FeatureCollection<GeoJSON.Point, { [name: string]: unknown }>): void => {
    const features = overlay.features.map(f => f.id);
    // when selection is cleared, restore all telemetry in the details pane
    if (features.length === 0 && pingsData) {
      setSelectedFeatureIDs([])
      return;
    }
    setSelectedFeatureIDs(features as number[]);
  };

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
    // console.log('drawing pings');
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

  const handleChangeFilters = (newRange: MapRange, filters: ICodeFilter[]) => {
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }
    if (filters.length) {
      console.log('new filters !');
    }
  }

  const handleSelectCritter = () => {
    setShowModal(o => !o);
  }

  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap();
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
      <MapSidebarFilters start={range.start} end={range.end} onChange={handleChangeFilters} />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='map' onKeyDown={handleKeyPress}></div>
        <div className={`bottom-panel ${showModal ? '' : 'appear-above-map'}`}>
          <MapDetails features={features} selectedFeatureIDs={selectedFeatureIDs} handleSelectCritter={handleSelectCritter}/>
        </div>
        <DialogFullScreen open={showModal} handleClose={setShowModal}>
          <div>hi</div>
        </DialogFullScreen>
      </div>
    </div>
  );
}
