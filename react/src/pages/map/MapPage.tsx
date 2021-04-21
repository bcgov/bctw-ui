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
import { setupPingOptions, setupSelectedPings, initMap, setPopupInnerHTML, hidePopup, setupLatestPingOptions, setupTracksOptions } from 'pages/map/map_init';
import { applyFilter, fillPoint, getLast10Fixes, getUniqueDevicesFromFeatures, groupFeaturesByCritters, groupFilters, splitPings } from 'pages/map/map_helpers';
import MapFilters from 'pages/map/MapFilters';
import MapOverView from 'pages/map/MapOverview';
import React, { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { ICodeFilter } from 'types/code';
import { ITelemetryDetail, ITelemetryFeature, ITracksFeature, MapRange, OnlySelectedCritters } from 'types/map';
import { formatDay, getToday } from 'utils/time';
import { TypeWithData } from 'types/common_types';
import AddUDF from 'pages/udf/AddUDF';
import useDidMountEffect from 'hooks/useDidMountEffect';

/**
  there are several forms of state in this page:
    a) the fetched pings/tracks state from the API 
    b) the 'displayed' data state, which is further divided into:
      1) what's displayed in the map
      2) what's displayed in the bottom details panel
  
  * applying a filter => applies to both displayed states.
  * applying 'last known location, last 10 fixes, show only selected' only filters what's visible in the map
   
  * A note about poor typings: 
     @method L.addData accepts an array, but the typing thinks it does not 
     ex this is typed fine 
      allOtherPings.forEach(p => pings.addData(p));
 */
export default function MapPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  let lastPointSelected = null;
  const mapRef = useRef<L.Map>(null);

  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());

  const selectedPingsLayer = new L.GeoJSON(); // the drawn shapes
  selectedPingsLayer.options = setupSelectedPings();

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });
  const [tracksRange, setTracksRange] = useState<MapRange>({start: range.start, end: range.end})

  // pings/tracks state is changed when filters are applied, so use these variables
  // for the 'global' state - used in bottom panel
  const [latestPings, setLatestPings] = useState<ITelemetryFeature[]>([]);
  const [pings, setPings] = useState<ITelemetryFeature[]>([]);
  const [selectedPingIDs, setSelectedPingIDs] = useState<number[]>([]);
  const [critterIDsDisplayed, setCritterIDsDisplayed] = useState<string[]>([]);

  // modal states - overview, export, udf editing
  const [showOverviewModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [overviewType, setOverviewType] = useState<TypeWithData>();
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showUdfEdit, setShowUdfEdit] = useState<boolean>(false);

  // filter state
  const [filters, setFilters] = useState<ICodeFilter[]>([]);

  // state for tracking filters that are only applied to map
  const [isMapOnlyFilterApplied, setIsMapOnlyFilterApplied] = useState<boolean>(false);
  const [onlySelected, setOnlySelected] = useState<OnlySelectedCritters>({show: false, critter_ids: []});
  const [onlyLastKnown, setOnlyLastKnown] = useState<boolean>(false);
  const [onlyLast10, setOnlyLast10] = useState<boolean>(false);

  // store the selection shapes
  const drawnItems = new L.FeatureGroup();

  // fetch the map data
  const { isFetching: fetchingTracks, isError: isErrorTracks, data: fetchedTracks } = bctwApi.useTracks(tracksRange.start, tracksRange.end);
  const { isFetching: fetchingPings, isError: isErrorPings, data: fetchedPings } = bctwApi.usePings(range.start, range.end, false);

  // refresh when start/end times are changed
  useEffect(() => {
    clearLayers();
  }, [range]);

  useEffect(() => {
    const update = (): void => {
      if (fetchedPings && !isErrorPings) {
        // must be called before adding data to pings layer
        setupPingOptions(pingsLayer, handlePointClick);
        setupLatestPingOptions(latestPingsLayer, handleLatestPointClick);

        setCritterIDsDisplayed(groupFeaturesByCritters(fetchedPings).map(c => c.critter_id));

        rebindMapListeners();

        const { latest, other } = splitPings(fetchedPings);

        // re-apply filters
        if (filters.length) {
          applyFiltersToPings(filters, other, latest);
        } else {
          setPings(other);
          setLatestPings(latest);
        }

        //fixme: what if map-only filters and normal filters are applied!?

        if (isMapOnlyFilterApplied) {
          // filter what's shown on the map, but not the bottom panel
          if (onlySelected.show) {
            const predicate = (l: ITelemetryFeature): boolean => onlySelected.critter_ids.includes(l.properties.critter_id);
            redrawLayers(fetchedPings.filter(predicate));
          } else if (onlyLast10) {
            redrawLayers(getLast10Fixes(fetchedPings));
          } else if (onlyLastKnown) {
            mapRef.current.removeLayer(pingsLayer);
            mapRef.current.removeLayer(tracksLayer);
          } 
        } else if (!filters.length) {
          pingsLayer.addData(other as any);
          latestPingsLayer.addData(latest as any);
        }

      }
    }
    update();
  }, [fetchedPings]);

  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      setupTracksOptions(tracksLayer);
      tracksLayer.addData(fetchedTracks as any);
      if (filters.length) {
        applyFiltersToTracks(fetchedTracks);
      }
    }
  }, [fetchedTracks]);

  // update tracks
  useEffect(() => {
    applyFiltersToTracks();
  }, [critterIDsDisplayed]);

  useEffect(() => {
    const b = onlyLast10 || onlyLastKnown || (onlySelected && onlySelected.show);
    setIsMapOnlyFilterApplied(b);
  }, [onlyLast10, onlyLastKnown, onlySelected])

  // initialize the map
  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap(mapRef, drawnItems, selectedPingsLayer, tracksLayer, pingsLayer, handleDrawShape, handleClosePopup);
      }
    };
    updateComponent();
  });

  // hide popup when modals are displayed
  useDidMountEffect(() => {
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
    if (lastPointSelected && lastPointSelected !== layer) {
      fillPoint(lastPointSelected);
      hidePopup();
    }
    lastPointSelected = layer;
    const feature: ITelemetryFeature = layer?.feature;
    fillPoint(layer, true);
    setPopupInnerHTML(feature);
    // set the feature id state so bottom panel will highlight the row
    setSelectedPingIDs([feature.id]);
  };

  /**
   * same as the point handler above, but leaflet icons don't have the setStyle function
   */
  const handleLatestPointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPointSelected && lastPointSelected !== layer) {
      hidePopup();
    }
    lastPointSelected = layer;
    const feature: ITelemetryFeature = layer?.feature;
    setPopupInnerHTML(feature);
    setSelectedPingIDs([feature.id]);
  }

  // when a map point is clicked that isn't a marker, close the popup
  const handleClosePopup = (): void => {
    if (lastPointSelected) {
      fillPoint(lastPointSelected, false);
      lastPointSelected = null;
      setSelectedPingIDs([]);
    }
    hidePopup();
  }

  // when rows are checked in the details panel, highlight them
  // fixme: the highlight fill color is reset when new data is fetched
  const handleDetailPaneRowSelect = (pingIds: number[]): void => {
    hidePopup();
    mapRef.current.eachLayer((layer: L.Polygon) => {
      const id = layer.feature?.id as number;
      fillPoint(layer, pingIds.includes(id));
    });
  };

  // handles the drawing and deletion of shapes, setup in map_init
  const handleDrawShape = (): void => {
    hidePopup();
    const clipper = drawnItems.toGeoJSON();
    const allPings = pingsLayer.toGeoJSON();
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);
    setFeatureIDsOnDraw(overlay);
    selectedPingsLayer.addData(overlay);
    if (!overlay.features.length) {
      selectedPingsLayer.clearLayers();
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
    if (featureIds.length === 0 && fetchedPings) {
      setSelectedPingIDs([]);
      return;
    }
    setSelectedPingIDs(featureIds as number[]);
  };

  // clears existing pings/tracks layers
  const clearLayers = (): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pingsLayer);
    layerPicker.removeLayer(tracksLayer);
    layerPicker.removeLayer(latestPingsLayer);

    // layerPicker.removeLayer(selectedPings);
    pingsLayer.clearLayers();
    tracksLayer.clearLayers();
    latestPingsLayer.clearLayers();
    selectedPingsLayer.clearLayers();
  };

  /**
   * clears existing pings/tracks layers, draws the new ones
   * @param newPings @param newTracks defaults to existing if not supplied
   */
  const redrawLayers = (newPings = fetchedPings, newTracks = fetchedTracks): void => {
    clearLayers();
    const { latest, other} = splitPings(newPings);
    latestPingsLayer.addData(latest as any);
    pingsLayer.addData(other as any);
    tracksLayer.addData(newTracks as any);
  };

  const redrawPings = (newPings: ITelemetryFeature[], newLatestPings = latestPings): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pingsLayer);
    layerPicker.removeLayer(latestPingsLayer);
    pingsLayer.clearLayers();
    latestPingsLayer.clearLayers();
    pingsLayer.addData(newPings as any);
    latestPingsLayer.addData(newLatestPings as any);
  }

  const redrawTracks = (newTracks: ITracksFeature[]): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(tracksLayer);
    tracksLayer.clearLayers();
    tracksLayer.addData(newTracks as any);
  }

  // triggered when side-panel filters are applied
  const applyChangesFromFilterPanel = (newRange: MapRange, filters: ICodeFilter[]): void => {
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
      setTracksRange(newRange);
    }
    setFilters(filters);
    applyFiltersToPings(filters);
  };

  // since filters sometimes need to be re-applied 
  // outside of the context of the {applyChangesFromFilterPanel}
  const applyFiltersToPings = (filters: ICodeFilter[], newFeatures = pings, newLatestFeatures = latestPings): void => {
    if (!filters.length) {
      // * reset the map state by calling {redrawLayers} with no parameters.
      // * reset the bottom panel state by calling {splitPings} with the global 'fetched' state
      const { latest, other } = splitPings(fetchedPings);
      setPings(other)
      setLatestPings(latest);
      redrawLayers();
      return;
    }
    const groupedFilters = groupFilters(filters);
    const filteredPings = applyFilter(groupedFilters, newFeatures);
    const filteredLPings = applyFilter(groupedFilters, newLatestFeatures);

    setPings(filteredPings);
    setLatestPings(filteredLPings);
    redrawPings(filteredPings, filteredLPings);

    // trigger the redraw of tracks
    setCritterIDsDisplayed(groupFeaturesByCritters(filteredPings).map((c) => c.critter_id));
  }

  /**
   * in order to know what tracks need to be updated, the filters need to be applied to pings first,
   * because that will determine which critters are displayed
   * this function will be triggered when @var {critterIDsDisplayed} is changed
   */
  const applyFiltersToTracks = (newTracks = fetchedTracks): void => {
    // fetchedTracks may be actually be undefined!
    if (!newTracks) { return }
    const filtered = newTracks.filter(t => critterIDsDisplayed.includes(t.properties.critter_id));
    redrawTracks(filtered);
  }

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
  // fixme: points within drawn polygons are still displayed
  const handleShowLastKnownLocation = (show: boolean): void => {
    setOnlyLastKnown(show);
    if (show) {
      mapRef.current.removeLayer(pingsLayer);
      mapRef.current.removeLayer(tracksLayer);
    } else {
      mapRef.current.addLayer(pingsLayer);
      mapRef.current.addLayer(tracksLayer);
    }
  };

  /**
   * @param b boolean on whether the map should be filtered to each critter's last 10 pings
   */
  // fixme: tracks are not hidden
  const handleShowLast10Fixes = (b: boolean): void => {
    setOnlyLast10(b);
    if (!b) {
      redrawLayers();
      return;
    }
    const last10FixesCombined = getLast10Fixes(fetchedPings);
    redrawPings(last10FixesCombined);
  }

  const handleShowOnlySelected = (o: OnlySelectedCritters): void => {
    setOnlySelected(o);
    const { show, critter_ids } = o;
    if (show) {
      const p = fetchedPings.filter(f => critter_ids.includes(f.properties.critter_id));
      const t = fetchedTracks.filter(f => critter_ids.includes(f.properties.critter_id));
      redrawLayers(p, t);
    } else {
      redrawLayers();
    }
  }

  // Add the tracks layer
  useEffect(() => {
    tracksLayer.addTo(mapRef.current);
  }, [tracksLayer]);

  // Add the ping layers
  useEffect(() => {
    pingsLayer.addTo(mapRef.current);
  }, [pingsLayer]);

  useEffect(() => {
    latestPingsLayer.addTo(mapRef.current);
  }, [latestPingsLayer]);

  // trigger download on ctrl+s keyboard input
  const handleKeyPress = (e): void => {
    if (!(e.ctrlKey && e.keyCode == 83)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    let kml;
    if ((selectedPingsLayer.toGeoJSON() as any).features.length > 0) {
      kml = tokml((selectedPingsLayer as any).toGeoJSON());
    } else {
      kml = tokml((pingsLayer as any).toGeoJSON());
    }
    download(kml, 'devices.kml', 'application/xml');
  };

  // todo: move this to separate component / wrapper
  // resizable state & handlers
  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(400);
  const [dragging, setDragging] = useState(false);
  // update the height of the bottom div 
  const onMove = (e: React.MouseEvent): void => {
    if (dragging) {
      const mpv = document.getElementById('map-view');
      const offset = mpv.offsetHeight-e.clientY;
      setBottomPanelHeight(offset);
    }
  }
  // when mouse is clicked on the 'drag' div id
  const onDown = (): void => setDragging(true);
  // consider the 'dragging' event finished when the mouse is released anywhere on the screen
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
        uniqueDevices={getUniqueDevicesFromFeatures(pings)}
        onApplyFilters={applyChangesFromFilterPanel}
        onClickEditUdf={(): void => setShowUdfEdit(o => !o)}
        onShowLatestPings={handleShowLastKnownLocation}
        onShowLastFixes={handleShowLast10Fixes}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='popup'/>
        <div id='map' onKeyDown={handleKeyPress} />
        <div style={{height: bottomPanelHeight}} className={`bottom-panel ${showOverviewModal || showExportModal || showUdfEdit ? '' : 'appear-above-map'}`}>
          <div onMouseDown={onDown} id='drag'></div>
          <MapDetails 
            features={[...pings, ...latestPings]}
            filters={filters}
            selectedFeatureIDs={selectedPingIDs}
            handleShowOnlySelected={handleShowOnlySelected}
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
