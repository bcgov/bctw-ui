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
import { setupPingOptions, setupSelectedPings, initMap, setPopupInnerHTML, hidePopup } from 'pages/map/map_init';
import { applyFilter, fillPoint, groupFeaturesByCritters, groupFilters } from 'pages/map/map_helpers';
import MapFilters from 'pages/map/MapFilters';
import MapOverView from 'pages/map/MapOverview';
import { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { ICodeFilter } from 'types/code';
import { ITelemetryDetail, ITelemetryFeature, MapRange } from 'types/map';
import { formatDay, getToday } from 'utils/time';
import { TypeWithData } from 'types/common_types';
import AddUDF from 'pages/udf/AddUDF';

export default function MapPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Tracks
  const [pings] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Pings

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });

  let lastPointClicked = null;

  // for map bottom panel state
  const [features, setFeatures] = useState<ITelemetryFeature[]>([]);
  const [selectedFeatureIDs, setSelectedFeatureIDs] = useState<number[]>([]);

  // for overview state
  const [showOverviewModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [overviewType, setOverviewType] = useState<TypeWithData>();

  // export state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // udf editing state
  const [showUdfEdit, setShowUdfEdit] = useState<boolean>(false);

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
        initMap(mapRef, drawnItems, selectedPings, tracks, pings, handleDrawShape, handleClosePopup);
      }
    };
    updateComponent();
  });

  useEffect(() => {
    if (showExportModal || showOverviewModal || showUdfEdit) {
      hidePopup();
    }
  }, [showExportModal, showOverviewModal, showUdfEdit])

  // when an individual map point is clicked, highlight it
  const handlePointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPointClicked && lastPointClicked !== layer) {
      fillPoint(lastPointClicked);
      hidePopup();
    }
    lastPointClicked = layer;
    const feature: ITelemetryFeature = layer?.feature;
    fillPoint(layer, true);
    setPopupInnerHTML(feature as any);
    setSelectedFeatureIDs([feature.id]);
  };

  // when a map point is clicked that isn't a marker, close the popup
  const handleClosePopup = (): void => {
    if (lastPointClicked) {
      fillPoint(lastPointClicked);
    }
    hidePopup();
    setSelectedFeatureIDs([]);
  }

  // when rows are selected in the bottom details panel
  const handleDetailPaneRowSelect = (ids: number[]): void => {
    // assume we're going into 'multiple point selection mode' and hide the popup first
    handleClosePopup();
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

  setupPingOptions(pings, handlePointClick);
  const selectedPings = new L.GeoJSON(); // Store the selected pings
  selectedPings.options = setupSelectedPings();

  // handles the drawing, setup in map_init
  const handleDrawShape = (): void => {
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    // More typescript type definition bugs... These are the right features!!!
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);
    // console.log('points in shape ', overlay.features.length)

    setFeatureIDsOnDraw(overlay);

    // Clear any previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        fillPoint(layer);
      }
    });
    selectedPings.addData(overlay);
  };
  
  // clear points within shape
  // fixme: restore the selected color to points within shape
  const handleDrawShapeLatest = (): void => {
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        mapRef.current.removeLayer(layer);
      }
    });
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

    // layerPicker.removeLayer(selectedPings);
    pings.clearLayers();
    tracks.clearLayers();
    selectedPings.clearLayers();
  };

  /**
   * clears existing pings/tracks layers, draws the new ones
   * @param newPings @param newTracks defaults to existing if not supplied
   */
  const drawLatestPings = (newPings = pingsData, newTracks = tracksData): void => {
    clearLatestPings();
    handleDrawShapeLatest();
    pings.addData(newPings);
    tracks.addData(newTracks as any);
  };

  // triggered when side-panel filters are applied
  const handleChangeFilters = (newRange: MapRange, filters: ICodeFilter[]): void => {
    // todo: does changing date and applying filters work at same time?
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }
    setFilters((o) => filters);
    const filteredPings = applyFilter(groupFilters(filters), features) as any;
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
    download(kml, 'devices.kml', 'application/xml');
  };

  return (
    <div className={'map-view'}>
      <MapFilters
        start={range.start}
        end={range.end}
        onApplyFilters={handleChangeFilters}
        onClickEditUdf={(): void => setShowUdfEdit(o => !o)}
        onShowLatestPings={handleShowLatestPings}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='map' onKeyDown={handleKeyPress}/>
        <div id='popup'/>
        <div className={`bottom-panel ${showOverviewModal || showExportModal || showUdfEdit ? '' : 'appear-above-map'}`}>
          <MapDetails
            features={features}
            filters={filters}
            selectedFeatureIDs={selectedFeatureIDs}
            handleShowOverview={handleShowOverview}
            handleHoverCritter={handleDetailPaneRowSelect}
            showExportModal={showExportModal}
            setShowExportModal={setShowExportModal}
          />
        </div>
        <DialogFullScreen open={showOverviewModal} handleClose={setShowModal}>
          <MapOverView type={overviewType} detail={selectedDetail} />
        </DialogFullScreen>
        <AddUDF open={showUdfEdit} handleClose={(): void => setShowUdfEdit(false)}/>
      </div>
    </div>
  );
}
