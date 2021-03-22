import * as L from 'leaflet'; // must be imported first
import './MapPage.scss';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';

import { CircularProgress } from '@material-ui/core';
import pointsWithinPolygon from '@turf/points-within-polygon';
import DialogFullScreen from 'components/modal/DialogFullScreen';
import dayjs from 'dayjs';
import download from 'downloadjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import MapDetails from 'pages/map/details/MapDetails';
import { setupPingOptions, setupSelectedPings, initMap, setPopupInnerHTML } from 'pages/map/map_init';
import { fillPoint, filterFeatures, groupFeaturesByCritters, groupFilters } from 'pages/map/map_helpers';
import MapFilters from 'pages/map/MapFilters';
import MapOverView from 'pages/map/MapOverview';
import { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { ICodeFilter } from 'types/code';
import { ITelemetryDetail, ITelemetryFeature, MapRange } from 'types/map';
import { formatDay, getToday } from 'utils/time';
import { TypeWithData } from 'types/common_types';

export default function MapPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Tracks
  const [pings] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Pings

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(14, 'day').format(formatDay),
    end: getToday()
  });

  let lastPointClicked = null;

  // for map bottom panel state
  const [features, setFeatures] = useState<ITelemetryFeature[]>([]);
  const [selectedFeatureIDs, setSelectedFeatureIDs] = useState<number[]>([]);

  // for overview state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [overviewType, setOverviewType] = useState<TypeWithData>();

  // store the selection shapes
  const drawnItems = new L.FeatureGroup();

  const { start, end } = range;
  const { isFetching: fetchingTracks, isError: isErrorTracks, data: tracksData } = bctwApi.useTracks(start, end);
  const { isFetching: fetchingPings, isError: isErrorPings, data: pingsData } = bctwApi.usePings(start, end);
  // const { isError: isErrorLatestPings, data: latestPingsData } = (bctwApi.usePings as any)(start, end);

  useEffect(() => {
    clearLatestPings();
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

  // initialize the map
  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap(mapRef, drawnItems, selectedPings, tracks, pings, handleDrawShape);
      }
    };
    updateComponent();
  });

  // when an individual map point is clicked, highlight it
  const handlePointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPointClicked && lastPointClicked !== layer) {
      fillPoint(lastPointClicked);
      setPopupInnerHTML(null, true);
    }
    lastPointClicked = layer;
    const feature: ITelemetryFeature = layer?.feature;
    fillPoint(layer, true);
    setPopupInnerHTML(feature as any);
    setSelectedFeatureIDs([feature.id]);
  };

  // revert highlight when popup is closed
  // const handlePointClosePopup = (event: L.LeafletEvent): void => {
  //   const layer = event.target;
  //   const feature: ITelemetryFeature = layer?.feature;
  //   setPopupInnerHTML(feature as any, true);
  //   setSelectedFeatureIDs([feature.id]);
  //   fillPoint(event.target);
  //   setSelectedFeatureIDs([]);
  // };

  // highlights the selected rows in bottom panel when mouse is hovered over a point
  const handlePointHover = (ids: number[]): void => {
    mapRef.current.eachLayer((layer) => {
      const l = layer as any;
      const id = l.feature?.id;
    
      if (ids.includes(id)) {
        fillPoint(l, true);
      } else if (typeof l.setStyle === 'function') {
        fillPoint(l, selectedFeatureIDs.includes(id));
      }
    });
  };

  // setupPingOptions(pings, handlePointClick, handlePointClosePopup);
  setupPingOptions(pings, handlePointClick);
  const selectedPings = new L.GeoJSON(); // Store the selected pings
  selectedPings.options = setupSelectedPings();

  // handles the drawing, called in map_init 
  const handleDrawShape = (): void => {
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    // More typescript type definition bugs... These are the right features!!!
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);

    setFeatureIDsOnDraw(overlay);

    // Clear any previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        // fixme: when rows are hovered after a shape is drawn,
        // the result is the points are removed completely
        // mapRef.current.removeLayer(layer);
        fillPoint(layer);
      }
    });
    selectedPings.addData(overlay);
  };

  // when shapes are drawn in {drawSelectedLayer}, set the selectedFeatureIDs 
  // status to the ids of the points in the shape
  const setFeatureIDsOnDraw = (
    overlay: GeoJSON.FeatureCollection<GeoJSON.Point, { [name: string]: unknown }>
  ): void => {
    const featureIds = overlay.features.map((f) => f.id);
    // when selection is cleared, restore all telemetry in the details pane
    if (featureIds.length === 0 && pingsData) {
      setSelectedFeatureIDs([]);
      return;
    }
    setSelectedFeatureIDs(featureIds as number[]);
  };

  // clears existing pings/tracks layers
  const clearLatestPings = (): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pings);
    layerPicker.removeLayer(tracks);
    pings.clearLayers();
    tracks.clearLayers();
  };

  /**
   * clears existing pings/tracks layers, draws the new ones
   * @param newPings @param newTracks defaults to existing if not supplied
   */
  const drawLatestPings = (newPings = pingsData, newTracks = tracksData): void => {
    clearLatestPings();
    pings.addData(newPings);
    tracks.addData(newTracks as any);
  };

  // triggered when side-panel filters are applied
  const handleChangeFilters = (newRange: MapRange, filters: ICodeFilter[]): void => {
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }
    setFilters((o) => filters);
    const filteredPings = filterFeatures(groupFilters(filters), features) as any;
    const uniqueCritters = groupFeaturesByCritters(filteredPings).map((c) => c.critter_id);
    const filteredTracks = (tracksData as any[]).filter((td) => uniqueCritters.includes(td.properties.critter_id));
    drawLatestPings(filteredPings, filteredTracks);
  };

  // show the critter overview modal when a row is clicked in bottom panel
  const handleShowOverview = (type: TypeWithData, row: ITelemetryDetail): void => {
    setOverviewType(type);
    setSelectedDetail(row);
    setShowModal((o) => !o);
  };

  // triggered when user clicks checkbox in filter panel
  const handleShowLatestPings = (b: boolean): void => {
    if (!b) {
      // restore default pings & tracks
      drawLatestPings();
      return;
    }
    const newFeatures = [];
    // to make sure we only get one result per group, group all features by critter id
    const grouped = groupFeaturesByCritters(features);
    for (let i = 0; i < grouped.length; i++) {
      // iterate groups, getting the most recent date
      const features = grouped[i].features;
      const latestFeature = features.reduce((accum, current) =>
        dayjs(current.properties.date_recorded).isAfter(dayjs(accum.properties.date_recorded)) ? current : accum
      );
      newFeatures.push(latestFeature);
    }
    drawLatestPings(newFeatures as any, []);
  };

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  }, [tracks]);

  // Add the ping layer
  useEffect(() => {
    pings.addTo(mapRef.current);
  }, [pings]);

  // trigger download on ctrl+s keyboard input
  const handleKeyPress = (e): void => {
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
      <MapFilters
        start={range.start}
        end={range.end}
        onApplyFilters={handleChangeFilters}
        onShowLatestPings={handleShowLatestPings}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='map' onKeyDown={handleKeyPress}></div>
        <div id='popup'></div>
        <div className={`bottom-panel ${showModal ? '' : 'appear-above-map'}`}>
          <MapDetails
            features={features}
            filters={filters}
            selectedFeatureIDs={selectedFeatureIDs}
            handleShowOverview={handleShowOverview}
            handleHoverCritter={handlePointHover}
          />
        </div>
        <DialogFullScreen open={showModal} handleClose={setShowModal}>
          <MapOverView type={overviewType} detail={selectedDetail} />
        </DialogFullScreen>
      </div>
    </div>
  );
}
