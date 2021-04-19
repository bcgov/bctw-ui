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
import { setupPingOptions, setupSelectedPings, initMap, setPopupInnerHTML, hidePopup, setupLatestPingOptions } from 'pages/map/map_init';
import { applyFilter, fillPoint, getGroupedLatestFeatures, getUniqueCritterIDsFromFeatures, getUniqueDevicesFromFeatures, groupFeaturesByCritters, groupFilters } from 'pages/map/map_helpers';
import MapFilters from 'pages/map/MapFilters';
import MapOverView from 'pages/map/MapOverview';
import React, { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { ICodeFilter } from 'types/code';
import { ITelemetryDetail, ITelemetryFeature, IUniqueFeature, MapRange } from 'types/map';
import { formatDay, getToday } from 'utils/time';
import { TypeWithData } from 'types/common_types';
import AddUDF from 'pages/udf/AddUDF';

export default function MapPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Tracks
  const [pings] = useState<L.GeoJSON>(new L.GeoJSON()); // Store Pings
  const [latestPingsByCritter] = useState<L.GeoJSON>(new L.GeoJSON());


  const selectedPings = new L.GeoJSON(); // the drawn shapes
  selectedPings.options = setupSelectedPings();

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });

  // for map bottom panel state, since the layers in pings gets overwritten
  // when filters are applied, use features to store the global fetched data
  const [latestFeatures, setLatestFeatures] = useState<ITelemetryFeature[]>([]);
  const [features, setFeatures] = useState<ITelemetryFeature[]>([]);
  const [selectedFeatureIDs, setSelectedFeatureIDs] = useState<number[]>([]);

  // the (initially hidden) overview modal state
  const [showOverviewModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [overviewType, setOverviewType] = useState<TypeWithData>();

  // filter state
  const [filters, setFilters] = useState<ICodeFilter[]>([]);

  // export state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // udf editing state
  const [showUdfEdit, setShowUdfEdit] = useState<boolean>(false);

  // store the selection shapes
  const drawnItems = new L.FeatureGroup();

  // fetch the map data
  const { start, end } = range;
  const { isFetching: fetchingTracks, isError: isErrorTracks, data: tracksData } = bctwApi.useTracks(start, end);
  const { isFetching: fetchingPings, isError: isErrorPings, data: pingsData } = bctwApi.usePings(start, end, /* fixme: */ false);

  // refresh when start/end times are changed
  useEffect(() => {
    clearLayers();
  }, [range]);

  useEffect(() => {
    if (tracksData && !isErrorTracks) {
      tracks.addData(tracksData as any);
    }
  }, [tracksData]);

  useEffect(() => {
    if (pingsData && !isErrorPings) {
      // must be called before adding data to pings
      setupPingOptions(pings, handlePointClick);
      setupLatestPingOptions(latestPingsByCritter, handleLatestPointClick);

      const latestPings = getGroupedLatestFeatures(groupFeaturesByCritters(pingsData));
      const latestIds = latestPings.map(l => l.id);
      const otherPings = pingsData.filter(p => !latestIds.includes(p.id));

      pings.addData(otherPings as any);
      latestPingsByCritter.addData(latestPings as any);

      setLatestFeatures(latestPings);
      setFeatures(otherPings);

      rebindMapListeners();
    }
  }, [pingsData]);

  let lastPoint = null;

  // initialize the map
  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap(mapRef, drawnItems, selectedPings, tracks, pings, handleDrawShape, handleClosePopup);
      }
    };
    updateComponent();
  });

  // hide popup when modals are displayed
  useEffect(() => {
    if (showExportModal || showOverviewModal || showUdfEdit) {
      hidePopup();
    }
  }, [showExportModal, showOverviewModal, showUdfEdit])

  /**
   * adding new data breaks the preclick handler, @var {lastPoint} is not in context. 
   * this function rebinds click handlers when new data is fetched
   */
  const rebindMapListeners = (): void => {
    if (mapRef.current) {
      mapRef.current
        .off('preclick')
        .on('preclick', handleClosePopup);
    }
  }

  /**
   * when a map point is clicked, 
   * a) populate the popup with metadata
   * b) show or hide the point
   * c) style the point
   */
  const handlePointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPoint && lastPoint !== layer) {
      fillPoint(lastPoint);
      hidePopup();
    }
    lastPoint = layer;
    const feature: ITelemetryFeature = layer?.feature;
    fillPoint(layer, true);
    setPopupInnerHTML(feature as any);
    // set the feature id state so bottom panel will highlight the row
    setSelectedFeatureIDs([feature.id]);
  };

  /**
   * same as the point handler above, but leaflet icons don't have the setStyle function
   */
  const handleLatestPointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPoint && lastPoint !== layer) {
      hidePopup();
    }
    lastPoint = layer;
    const feature: ITelemetryFeature = layer?.feature;
    setPopupInnerHTML(feature as any);
    setSelectedFeatureIDs([feature.id]);
  }

  // when a map point is clicked that isn't a marker, close the popup
  const handleClosePopup = (): void => {
    if (lastPoint) {
      fillPoint(lastPoint, false);
      lastPoint = null;
      setSelectedFeatureIDs([]);
    }
    hidePopup();
  }

  /**
   * when rows are checked in the details panel
   * a) hide the popup
   * b) style the selected points
   * @param ids the feature IDs for the critter(s) selected
   * @param shouldFilterMapPoints is 'Show Only Selected' checked?
   */
  const handleDetailPaneRowSelect = (ids: number[], shouldFilterMapPoints: boolean): void => {
    hidePopup();

    if (shouldFilterMapPoints) {
      const p = features.filter(f => ids.includes(f.id));
      const lp = latestFeatures.filter(f => ids.includes(f.id));
      const t = tracksData.filter(f => {
        const uniqueCritters = getUniqueCritterIDsFromFeatures(features, ids);
        return uniqueCritters.includes(f.properties.critter_id);
      });
      redrawLayers(p, lp, t);
    } else {
      redrawLayers();
    }

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

  // handles the drawing and deletion of shapes, setup in map_init
  const handleDrawShape = (): void => {
    hidePopup();
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);
    setFeatureIDsOnDraw(overlay);

    // clear previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        fillPoint(layer);
      }
    });

    selectedPings.addData(overlay);

    if (!overlay.features.length) {
      selectedPings.clearLayers();
    } 
  };
  
  /**
   * when shapes are drawn in {drawSelectedLayer}, 
   * set the selectedFeatureIDs state
  */
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
  const clearLayers = (): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pings);
    layerPicker.removeLayer(tracks);
    layerPicker.removeLayer(latestPingsByCritter);

    // layerPicker.removeLayer(selectedPings);
    pings.clearLayers();
    tracks.clearLayers();
    latestPingsByCritter.clearLayers();
    selectedPings.clearLayers();
  };

  /**
   * clears existing pings/tracks layers, draws the new ones
   * @param newPings @param newTracks defaults to existing if not supplied
   */
  const redrawLayers = (newPings = features, newLatestPings = latestFeatures, newTracks = tracksData): void => {
    clearLayers();
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        mapRef.current.removeLayer(layer);
      }
    });
    tracks.addData(newTracks as any);
    pings.addData(newPings as any);
    latestPingsByCritter.addData(newLatestPings as any);
  };

  // triggered when side-panel filters are applied
  const handleChangeFilters = (newRange: MapRange, filters: ICodeFilter[]): void => {
    // fixme: does changing date and applying filters work at same time?
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }

    setFilters(filters);
    const groupedFilters = groupFilters(filters);

    const p = applyFilter(groupedFilters, features);
    const lp = applyFilter(groupedFilters, latestFeatures);

    const critters = groupFeaturesByCritters(p).map((c) => c.critter_id);
    const newTracks = tracksData.filter((td) => critters.includes(td.properties.critter_id));

    redrawLayers(p, lp, newTracks);
  };

  // show the critter overview modal when a row is clicked in bottom panel
  const handleShowOverview = (type: TypeWithData, row: ITelemetryDetail): void => {
    setOverviewType(type);
    setSelectedDetail(row);
    setShowModal((o) => !o);
  };

  /**
   * triggered when user clicks checkbox in filter panel
   * since latest pings are a separate layer, this toggles the pings/tracks layers
   * @param show should only the latest pings be shown?
   */
  const handleShowLatestPings = (show: boolean): void => {
    if (show) {
      mapRef.current.removeLayer(pings);
      mapRef.current.removeLayer(tracks);
    } else {
      mapRef.current.addLayer(pings);
      mapRef.current.addLayer(tracks);
    }
  };

  const handleShowLast10Fixes = (b: boolean): void => {
    if (!b) {
      redrawLayers();
      return;
    }
    const p = [];
    const grouped: IUniqueFeature[] = groupFeaturesByCritters(pingsData);
    for (let i = 0; i < grouped.length; i++) {
      const features = grouped[i].features;
      const sorted = features.sort((a, b) => {
        return new Date(b.properties.date_recorded).getTime() - new Date(a.properties.date_recorded).getTime();
      });
      const last10 = sorted.filter((s, idx) => idx <= 9);
      // console.log(last10.map(d => d.properties.date_recorded))
      p.push(...last10);
    }
    // todo: update tracks??
    redrawLayers(p);
  }

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  }, [tracks]);

  // Add the ping layers
  useEffect(() => {
    pings.addTo(mapRef.current);
  }, [pings]);

  useEffect(() => {
    latestPingsByCritter.addTo(mapRef.current);
  })

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

  const [bottomHeight, setBottomHeight] = useState<number>(400);
  const [dragging, setDragging] = useState(false);

  const onMove = (e: React.MouseEvent): void => {
    if (dragging) {
      const mpv = document.getElementById('map-view');
      const offset = mpv.offsetHeight-e.clientY;
      setBottomHeight(offset);
    }
  }

  const onDown = (): void => {
    setDragging(true);
  }

  const onUp = (): void => {
    if (dragging) {
      setDragging(false);
    }
  }

  return (
    <div id={'map-view'} onMouseUp={onUp} onMouseMove={onMove}>
      <MapFilters
        start={range.start}
        end={range.end}
        uniqueDevices={getUniqueDevicesFromFeatures(features)}
        onApplyFilters={handleChangeFilters}
        onClickEditUdf={(): void => setShowUdfEdit(o => !o)}
        onShowLatestPings={handleShowLatestPings}
        onShowLastFixes={handleShowLast10Fixes}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='popup'/>
        <div id='map' onKeyDown={handleKeyPress} />
        <div style={{height: bottomHeight}} className={`bottom-panel ${showOverviewModal || showExportModal || showUdfEdit ? '' : 'appear-above-map'}`}>
          <div onMouseDown={onDown} id='drag'></div>
          <MapDetails 
            features={[...features, ...latestFeatures]}
            filters={filters}
            selectedFeatureIDs={selectedFeatureIDs}
            handleShowOverview={handleShowOverview}
            handleRowSelected={handleDetailPaneRowSelect}
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
