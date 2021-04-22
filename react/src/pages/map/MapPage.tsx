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
import { initMap, setPopupInnerHTML, hidePopup } from 'pages/map/map_init';
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
import { setupLatestPingOptions, setupPingOptions, setupSelectedPings, setupTracksOptions, setupUnassignedPings } from 'pages/map/point_setup';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import { MapStrings } from 'constants/strings';

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
  const mapRef = useRef<L.Map>(null);
  let lastPointClicked = null;

  // pings layer state
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());

  // tracks layer state
  const [unassignedPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Unassigned Pings
  const [unassignedTracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Unassigned Tracks

  // the drawn shapes layer
  const selectedPingsLayer = new L.GeoJSON();
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
  // const [unassignedPings, setUnassignedPings] = useState<ITelemetryFeature[]>([]);
  const [selectedPingIDs, setSelectedPingIDs] = useState<number[]>([]);
  const [critterIDsDisplayed, setCritterIDsDisplayed] = useState<string[]>([]);

  // modal states - overview, export, udf editing
  const [showOverviewModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [overviewType, setOverviewType] = useState<TypeWithData>();
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showUdfEdit, setShowUdfEdit] = useState<boolean>(false);

  // state tracking whether or not unassigned device layers are shown
  const [showUnassignedLayers, setShowUnassignedLayers] = useState<boolean>(false);

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
  const { isFetching: fetchingPings, isError: isErrorPings, data: fetchedPings } = bctwApi.usePings(range.start, range.end);
  const { isError: isErrorUPings, data: fetchedUnassignedPings } = bctwApi.useUnassignedPings(range.start, range.end);
  const { isFetching: fetchingTracks, isError: isErrorTracks, data: fetchedTracks } = bctwApi.useTracks(tracksRange.start, tracksRange.end);
  const { isError: isErrorUTracks, data: fetchedUnassignedTracks } = bctwApi.useUnassignedTracks(tracksRange.start, tracksRange.end);

  // refresh when start/end times are changed
  useEffect(() => {
    clearLayers();
  }, [range]);

  // assigned pings
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

  // unassigned pings
  useEffect(() => {
    if (fetchedUnassignedPings && !isErrorUPings) {
      setupUnassignedPings(unassignedPingsLayer, handlePointClick);
      unassignedPingsLayer.addData(fetchedUnassignedPings as any);
      // initially hide unassigned points
      // if (!showUnassignedLayers) {
      //   mapRef?.current?.removeLayer(unassignedPingsLayer);
      // }
    }
  }, [fetchedUnassignedPings]);

  // assigned tracks
  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      setupTracksOptions(tracksLayer, false);
      tracksLayer.addData(fetchedTracks as any);
      if (filters.length) {
        applyFiltersToTracks(fetchedTracks);
      }
    }
  }, [fetchedTracks]);

  // unassigned tracks
  useEffect(() => {
    if (fetchedUnassignedTracks && !isErrorUTracks) {
      setupTracksOptions(unassignedTracksLayer, true);
      unassignedTracksLayer.addData(fetchedUnassignedTracks as any);
      // initially hide unassigned points
      // if (!showUnassignedLayers) {
      //   mapRef.current?.removeLayer(unassignedTracksLayer);
      // }
    }
  }, [fetchedTracks]);

  // causes tracks to refresh
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
      tracksLayer.bringToBack();
    };
    updateComponent();
  });

  // hide popup when modals are displayed
  useDidMountEffect(() => {
    if (showExportModal || showOverviewModal || showUdfEdit) {
      hidePopup();
    }
  }, [showExportModal, showOverviewModal, showUdfEdit])


  // hide or show unattached layers
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref) {
      return;
    }
    if (showUnassignedLayers) {
      ref.addLayer(unassignedPingsLayer);
      ref.addLayer(unassignedTracksLayer);
    } else {
      ref.removeLayer(unassignedPingsLayer);
      ref.removeLayer(unassignedTracksLayer);
    }
  }, [showUnassignedLayers])

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
    if (lastPointClicked && lastPointClicked !== layer) {
      fillPoint(lastPointClicked);
      hidePopup();
    }
    lastPointClicked = layer;
    const feature: ITelemetryFeature = layer?.feature;
    fillPoint(layer, true);
    setPopupInnerHTML(feature);
    if (feature.properties.critter_id) {
      // set the feature id state so bottom panel will highlight the row (if this is an assigned point)
      setSelectedPingIDs([feature.id]);
    }
  };

  /**
   * same as the point handler above, but leaflet icons don't have the setStyle function
   */
  const handleLatestPointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    if (lastPointClicked && lastPointClicked !== layer) {
      hidePopup();
    }
    lastPointClicked = layer;
    const feature: ITelemetryFeature = layer?.feature;
    setPopupInnerHTML(feature);
    setSelectedPingIDs([feature.id]);
  }

  // when a map point is clicked that isn't a marker, close the popup
  const handleClosePopup = (): void => {
    if (lastPointClicked) {
      fillPoint(lastPointClicked, false);
      lastPointClicked = null;
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

  const getAssignedLayers = (): L.Layer[] => [latestPingsLayer, pingsLayer, tracksLayer];
  const getAllLayers = (): L.Layer[] => [...getAssignedLayers(), unassignedPingsLayer, unassignedTracksLayer];

  /**
   * when device assignment status select dropdown is changed
   * show or hide layers depending on what was selected
   */
  const handleShowUnassignedDevices = (o: ISelectMultipleData[]): void => {
    const values = o.map(s => s.value);
    const ref = mapRef.current;
    const layers = [0, 2].includes(values.length) ? getAllLayers() : getAssignedLayers();

    // when all or no options are selected
    if (layers.length > 3) { // ie - we are showing/hiding all layers
      if (values.length === 2) { // show all was selected
        layers.forEach(l => ref.addLayer(l));
      } else if (values.length === 0) { // hide all was selected
        layers.forEach(l => ref.removeLayer(l));
      }
      return;
    }

    // show layers on the map representing devices that have telemetry but no animal 'attached'
    setShowUnassignedLayers(values.includes(MapStrings.assignmentStatusOptionU));

    if (values.includes(MapStrings.assignmentStatusOptionA)) {
      layers.forEach(l => ref.addLayer(l))
    } else {
      layers.forEach(l => ref.removeLayer(l))
    }
  }

  // Add the tracks layer
  useEffect(() => {
    tracksLayer.addTo(mapRef.current)
  }, [tracksLayer]);

  useEffect(() => {
    unassignedTracksLayer.addTo(mapRef.current);
    unassignedTracksLayer.on('add', (l) => l.target.bringToBack());
  }, [unassignedTracksLayer]);

  // Add the ping layers
  useEffect(() => {
    pingsLayer.addTo(mapRef.current);
  }, [pingsLayer]);

  useEffect(() => {
    latestPingsLayer.addTo(mapRef.current);
  }, [latestPingsLayer]);

  useEffect(() => {
    unassignedPingsLayer.addTo(mapRef.current);
  }, [unassignedPingsLayer]);

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
  // Style the map switching button
  const switchMapStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'white',
    color: '#464646',
    width: '2.85rem',
    height: '2.85rem',
    top: '183px',
    left: '10px',
    zIndex: 1000,
    borderRadius: '4px',
    cursor: 'pointer'
  } as React.CSSProperties;

  // Style the image inside the map switching button
  const iconStyle = {
    transform: 'scale(0.7)',
    opacity: '0.7'
  };

  // The flag for which map is showing
  let map3D = false;
  
  /**
   * ##toggleMap3D
   * Toggle value of _map3D_ for displaying 2D and 3D maps.
   * @returns Boolean
   */
  const toggleMap3D = () => map3D = !map3D;


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
        onShowUnassignedDevices={handleShowUnassignedDevices}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='popup'/>
        
        {/* The 2D map container */}
        <div id='map' onKeyDown={handleKeyPress} />

        {/* The layer switching button*/}
        <div style={switchMapStyle} onClick={toggleMap3D}>
          <img style={iconStyle}/>
        </div>

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
