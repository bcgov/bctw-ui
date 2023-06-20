import * as L from 'leaflet'; // must be imported first
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import './MapPage.scss';

import { mdiDragHorizontalVariant } from '@mdi/js';
import Icon from '@mdi/react';
import { CircularProgress, Paper } from '@mui/material';
import { Feature, MultiPoint } from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';
import dayjs from 'dayjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import MapFilters from 'pages/map/MapFilters';
import MapLayerToggleControl from 'pages/map/MapLayerToggle';
import MapOverView from 'pages/map/MapOverview';
import MapDetails from 'pages/map/details/MapDetails';
import {
  applyFilter,
  getLast10Fixes,
  getUniqueCritterIDsFromSelectedPings,
  groupFilters,
  splitPings,
  updatePings
} from 'pages/map/map_helpers';
import { hidePopup, initMap, setPopupInnerHTML } from 'pages/map/map_init';
import {
  setupLatestPingOptions,
  setupPingOptions,
  setupSelectedPings,
  setupTracksOptions
} from 'pages/map/point_setup';
import AddUDF from 'pages/udf/AddUDF';
import React, { useEffect, useRef, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { BCTWType } from 'types/common_types';
import { ITelemetryDetail, ITelemetryLine, ITelemetryPoint, MapRange } from 'types/map';
import { eUDFType } from 'types/udf';
import { formatDay, getToday } from 'utils/time';
import { MarkerProvider, createMarkersStates, updateLayers, useMarkerStates } from './MapMarkerContext';

export default function MapPage(): JSX.Element {
  return (
    <MarkerProvider>
      <Map />
    </MarkerProvider>
  );
}

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
export function Map(): JSX.Element {
  const api = useTelemetryApi();
  const mapRef = useRef<L.Map>(null);

  // pings layer state
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());

  // tracks layer state
  const selectedPingsLayer = new L.GeoJSON();
  selectedPingsLayer.options = setupSelectedPings();

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });
  // pings/tracks state is changed when filters are applied, so use these variables for the 'global' state - used in bottom panel
  const [filteredPings, setFilteredPings] = useState<ITelemetryPoint[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<ITelemetryLine[]>([]);

  // holds the most recently fetched pings data
  const [fetchedPings, setFetchedPings] = useState<ITelemetryPoint[]>([]);

  // modal states - overview, export, udf editing
  const [showOverviewModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [overviewType, setOverviewType] = useState<BCTWType>();
  const [showUdfEdit, setShowUdfEdit] = useState(false);

  // filter state
  const [filters, setFilters] = useState<ICodeFilter[]>([]);

  // state for tracking filters that limit map layers
  const [isMapOnlyFilterApplied, setIsMapOnlyFilterApplied] = useState(false);
  const [onlyLastKnown, setOnlyLastKnown] = useState(false);
  const [onlyLast10, setOnlyLast10] = useState(false);

  // Centralized state-management for marker selection and color-effects
  const [markerStates, markerDispatch] = useMarkerStates();

  useEffect(() => {
    updateLayers(markerStates);
  }, [markerStates]);

  // when the selected markers changes, show only those markers, but if its empty, show all
  useEffect(() => {
    if (fetchedPings && fetchedTracks) {
      applyFiltersToPings(filters);
    }
    if (markerStates.selectedMarkers.size > 0) {
      const p = (filteredPings ?? fetchedPings).filter((f) => markerStates.selectedMarkers.has(f.id));
      const t = (filteredTracks ?? fetchedTracks).filter((f) =>
        markerStates.selectedCritters.includes(f.properties.critter_id)
      );
      redrawLayers(p, t);
    } else if (fetchedPings && fetchedTracks) {
      redrawLayers();
    }
  }, [markerStates.selectedCritters]);

  // re-apply filters when onlyLastKnown or onlyLast10 changes
  useEffect(() => {
    if (fetchedPings && fetchedTracks) {
      markerDispatch({ type: 'RESET_ALL' });
      redrawLayers();
      applyFiltersToPings(filters);
    }
  }, [onlyLastKnown, onlyLast10]);

  // store the selection shapes
  const drawnItems = new L.FeatureGroup();
  const drawnLines = [];

  // fetch the map data
  const { start, end } = range;
  const { isLoading: isLoadingPings, isError: isErrorPings, data: baseFetchedPings } = api.usePings(start, end);

  const { isError: isErrorTracks, data: fetchedTracks } = api.useTracks(start, end);

  // Update the fetchedPings using helper function to instantiate TelemetryDetail classes
  useEffect(() => {
    if (baseFetchedPings && !isErrorPings) {
      setFetchedPings(updatePings(baseFetchedPings));
    }
  }, [baseFetchedPings]);

  // refetch pings when start/end times are changed
  useEffect(() => {
    // wipe the attribute panel state on refresh
    clearLayers();
  }, [range]);

  // assigned pings
  useEffect(() => {
    const update = (): void => {
      if (fetchedPings && !isErrorPings) {
        // must be called before adding data to pings layer
        setupPingOptions(pingsLayer, handlePointClick, handlePointClose);
        setupLatestPingOptions(latestPingsLayer, handlePointClick, handlePointClose);
        // re-apply filters
        if (filters.length) {
          applyFiltersToPings(filters);
        } else {
          setFilteredPings(fetchedPings);
          setFilteredTracks(fetchedTracks);
        }

        if (isMapOnlyFilterApplied) {
          // filter what's shown on the map, but not the bottom panel
          if (onlyLast10) {
            const { pings, tracks } = getLast10Fixes(fetchedPings, fetchedTracks ?? []);
            redrawPings(pings);
            redrawTracks(tracks);
          } else if (onlyLastKnown) {
            mapRef.current.removeLayer(pingsLayer);
            mapRef.current.removeLayer(tracksLayer);
          }
        } else if (!filters.length) {
          const { latest, other } = splitPings(fetchedPings);
          pingsLayer.addData(other as unknown as GeoJSON.GeoJsonObject);
          latestPingsLayer.addData(latest as unknown as GeoJSON.GeoJsonObject);
        }
      }
    };
    update();
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  }, [fetchedPings]);

  // assigned tracks
  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      setupTracksOptions(tracksLayer);
      /* 
        todo: only last 10 fixes is and needs to be handled when pings are updated?
        since pings are what filter the tracks?
      */
      if (filters.length) {
        applyFiltersToTracks(filteredPings);
      } else {
        tracksLayer.addData(fetchedTracks as unknown as GeoJSON.GeoJsonObject);
      }
    }
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  }, [fetchedTracks]);

  useEffect(() => {
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  }, [filteredPings]);

  // when one of the map only filters are applied, set the state
  useEffect(() => {
    const b = onlyLast10 || onlyLastKnown;
    setIsMapOnlyFilterApplied(b);
  }, [onlyLast10, onlyLastKnown]);

  // initialize the map
  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap(
          mapRef,
          drawnItems,
          // selectedPingsLayer,
          handleDrawShape,
          handleDrawLine,
          handleDeleteLine,
          handleDeleteLayer
        );
      }
      tracksLayer.bringToBack();
    };
    updateComponent();
  });

  // hide popup when modals are displayed
  useDidMountEffect(() => {
    if (showOverviewModal || showUdfEdit) {
      hidePopup();
    }
  }, [showOverviewModal, showUdfEdit]);
  /**
   * when a map point is clicked,
   * populate the popup with metadata and show it
   */
  const handlePointClick = (event: L.LeafletEvent): void => {
    const layer = event.target;
    const feature: ITelemetryPoint = layer?.feature;
    setPopupInnerHTML(feature);
    // event.target.prevStyle = getStyle(event);
    // set the feature id state so bottom panel will highlight the row
    markerDispatch({ type: 'SELECT_MARKERS', ids: [feature.id] });
  };

  /**
   * when the native leaflet popup (always hidden) is 'closed'
   */
  const handlePointClose = (event: L.LeafletEvent): void => {
    hidePopup();

    // unhighlight them in bottom table
    markerDispatch({ type: 'UNSELECT_MARKERS', ids: [event.target.feature.id] });
  };

  type IPointsWithinPolygon = Parameters<typeof pointsWithinPolygon>;
  // handles the drawing and deletion of shapes, setup in map_init
  // todo: does not handle unassigned layers yet
  const handleDrawShape = (): void => {
    hidePopup();
    const clipper = drawnItems.toGeoJSON();
    const pings = pingsLayer.toGeoJSON();

    const overlay = pointsWithinPolygon(pings as IPointsWithinPolygon[0], clipper as IPointsWithinPolygon[1]);

    const ids = [...(overlay.features.map((f) => f.id) as number[])];

    const latestPings = latestPingsLayer.toGeoJSON();
    const overlayLatest = pointsWithinPolygon(
      latestPings as IPointsWithinPolygon[0],
      clipper as IPointsWithinPolygon[1]
    );
    const latestIds = [...(overlayLatest.features.map((f) => f.id) as number[])];

    // highlight these rows in bottom panel
    markerDispatch({ type: 'SELECT_MARKERS', ids: [...ids, ...latestIds] });
    markerDispatch({
      type: 'SELECT_CRITTERS',
      ids: [
        ...overlay.features.map((f) => {
          const cast = f as Feature<MultiPoint & { properties: { critter_id: string } }>;
          return cast.properties.critter_id;
        }),
        ...overlayLatest.features.map((f) => {
          const cast = f as Feature<MultiPoint & { properties: { critter_id: string } }>;
          return cast.properties.critter_id;
        })
      ]
    });
  };

  const handleDeleteLayer = (): void => {
    markerDispatch({ type: 'RESET_SELECTION' });
  };

  // note: using L.Layergroup isn't removing marker
  const handleDrawLine = (l: L.Layer): void => {
    drawnLines.push(l);
  };

  // triggered when 'Delete' is clicked in the draw control
  const handleDeleteLine = (): void => {
    if (drawnLines.length) {
      drawnLines.forEach((l) => {
        mapRef.current.removeLayer(l);
      });
    }
  };

  // clears existing pings/tracks layers
  const clearLayers = (): void => {
    const layerPicker = L.control.layers();
    const allLayers = [...getAssignedLayers()];
    allLayers.forEach((l) => {
      layerPicker.removeLayer(l);
      if (typeof (l as L.GeoJSON).clearLayers === 'function') {
        (l as L.GeoJSON).clearLayers();
      }
    });
  };

  /**
   * clears existing pings/tracks layers, draws the new ones
   * @param newPings @param newTracks defaults to existing if not supplied
   */
  const redrawLayers = (
    newPings = filteredPings ?? fetchedPings,
    newTracks = filteredTracks ?? fetchedTracks
  ): void => {
    clearLayers();
    const { latest, other } = splitPings(newPings);
    latestPingsLayer.addData(latest as unknown as GeoJSON.GeoJsonObject);
    pingsLayer.addData(other as unknown as GeoJSON.GeoJsonObject);
    tracksLayer.addData(newTracks as unknown as GeoJSON.GeoJsonObject);
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  };

  // redraw only pings, if no params supplied it will default the fetched ones
  const redrawPings = (newPings: ITelemetryPoint[]): void => {
    const { latest, other } = splitPings(newPings);
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pingsLayer);
    layerPicker.removeLayer(latestPingsLayer);
    pingsLayer.clearLayers();
    latestPingsLayer.clearLayers();
    pingsLayer.addData(other as unknown as GeoJSON.GeoJsonObject);
    latestPingsLayer.addData(latest as unknown as GeoJSON.GeoJsonObject);
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  };

  // redraw only tracks
  const redrawTracks = (newTracks: ITelemetryLine[]): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(tracksLayer);
    tracksLayer.clearLayers();
    tracksLayer.addData(newTracks as unknown as GeoJSON.GeoJsonObject);
    const markerData = createMarkersStates(tracksLayer, pingsLayer, latestPingsLayer);
    markerDispatch({ type: 'SET_MARKERS', markers: markerData });
  };

  // triggered when side-panel filters are applied
  const handleApplyChangesFromFilterPanel = (newRange: MapRange, filters: ICodeFilter[]): void => {
    setFilters(filters);
    applyFiltersToPings(filters);
  };

  const handleApplyChangesFromSearchPanel = (newRange: MapRange, filters: ICodeFilter[]): void => {
    // if the timerange was changed, update that first. will trigger refetch
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }
    // otherwise, update the filter state and apply the filters
    setFilters(filters);
    applyFiltersToPings(filters);
  };

  // the handler that actually updates the ping state when the filter state is changed
  const applyFiltersToPings = (filters: ICodeFilter[]): void => {
    handleShowLastKnownLocation(onlyLastKnown);
    // eslint-disable-next-line prefer-const
    let { pings, tracks } = onlyLast10
      ? getLast10Fixes(fetchedPings, fetchedTracks)
      : { pings: fetchedPings, tracks: fetchedTracks };
    if (!filters.length) {
      // reset map state and bottom panel state
      setFilteredPings(pings);
      setFilteredTracks(tracks);
      redrawLayers(pings, tracks);
      return;
    }
    const groupedFilters = groupFilters(filters);
    pings = applyFilter(groupedFilters, pings);

    setFilteredPings(pings);
    redrawPings(pings);

    applyFiltersToTracks(pings, tracks);
  };

  /**
   * in order to know what tracks need to be updated, the filters need to be applied to pings first,
   * because that will determine which critters are displayed
   * this function will be triggered when @var {critterIDsDisplayed} is changed
   */
  const applyFiltersToTracks = (p = filteredPings, tracks = fetchedTracks): void => {
    if (!tracks) {
      return;
    }
    const uniqueCritterIDs = getUniqueCritterIDsFromSelectedPings(
      p,
      filteredPings.map((p) => p.id)
    );
    const filteredTracks = tracks.filter((t) => uniqueCritterIDs.includes(t.properties.critter_id));
    setFilteredTracks(filteredTracks);
    redrawTracks(filteredTracks);
  };

  // show the critter overview modal when a row is clicked in bottom panel
  const handleShowOverview = (type: BCTWType, row: ITelemetryDetail): void => {
    setOverviewType(type);
    setSelectedDetail(row);
    setShowModal((o) => !o);
  };

  /**
   * triggered when user clicks checkbox in filter panel
   * since latest pings are a separate layer, this toggles the pings/tracks layers
   * @param show should only the latest pings be shown?
   * fixme: points within drawn polygons are still displayed
   */
  const handleShowLastKnownLocation = (show: boolean): void => {
    if (show) {
      mapRef.current.removeLayer(pingsLayer);
      mapRef.current.removeLayer(tracksLayer);
    } else {
      mapRef.current.addLayer(pingsLayer);
      mapRef.current.addLayer(tracksLayer);
    }
  };

  const toggleTracks = (show: boolean): void => {
    const ref = mapRef.current;
    // copied this line below to remove these statements from inside the else
    const l = getTracksLayers()[0];
    show ? ref.addLayer(l) : ref.removeLayer(l);
    tracksLayer.bringToBack();
  };

  const togglePings = (show: boolean): void => {
    const ref = mapRef.current;
    // const layers = showUnassignedLayers ? getPingLayers() : getPingLayers().slice(0, 2);
    const layers = getPingLayers().slice(0, 2);
    layers.forEach((l) => (show ? ref.addLayer(l) : ref.removeLayer(l)));
  };

  const getAssignedLayers = (): L.Layer[] => [latestPingsLayer, pingsLayer, tracksLayer];
  const getTracksLayers = (): L.Layer[] => [tracksLayer];
  const getPingLayers = (): L.Layer[] => [pingsLayer, latestPingsLayer];

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

  // todo: move this to separate component / wrapper
  // resizable state & handlers
  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(300);
  const [bottomPanelPos, setBottomPanelPos] = useState<number>(null);
  const [dragging, setDragging] = useState(false);

  // update the height of the bottom panel
  const onMove = (e: React.MouseEvent): void => {
    if (dragging) {
      const mbp = document.getElementById('map-bottom-panel');
      const mv = document.getElementById('map-view');
      const height = bottomPanelHeight + (bottomPanelPos - e.clientY);
      if (height <= mv.offsetHeight && height >= 80) {
        mbp.style.height = `${height}px`;
      }
    }
  };
  // when mouse is clicked on the 'drag' div id
  const onDown = (e: React.MouseEvent): void => {
    const mbp = document.getElementById('map-bottom-panel');
    setBottomPanelPos(e.clientY);
    setBottomPanelHeight(mbp.offsetHeight);
    setDragging(true);
  };
  // consider the 'dragging' event finished when the mouse is released anywhere on the screen
  const onUp = (): void => {
    if (dragging) {
      setDragging(false);
    }
  };
  return (
    <div id={'map-view'} onMouseUp={onUp} onMouseMove={onMove}>
      <MapFilters
        start={range.start}
        end={range.end}
        pings={filteredPings ?? []}
        onApplySearch={handleApplyChangesFromSearchPanel}
        onApplyFilters={handleApplyChangesFromFilterPanel}
        onClickEditUdf={(): void => setShowUdfEdit((o) => !o)}
        // todo: trigger when filter panel transition is completed without timeout
        onCollapsePanel={(): unknown => setTimeout(() => mapRef.current.invalidateSize(), 200)}
        onShowLatestPings={setOnlyLastKnown}
        onShowLastFixes={setOnlyLast10}
        isFetching={isLoadingPings}
      />
      <div className={'map-container'}>
        {isLoadingPings ? <CircularProgress className='progress' color='secondary' /> : null}

        <div id='popup' style={{ bottom: bottomPanelHeight }} />

        <div id='map'>
          <MapLayerToggleControl handleTogglePings={togglePings} handleToggleTracks={toggleTracks} />
        </div>
        <Paper
          style={{ height: bottomPanelHeight, borderRadius: 0 }}
          className={`map-bottom-panel ${showOverviewModal || showUdfEdit ? '' : 'appear-above-map'}`}
          id={`map-bottom-panel`}>
          <div onMouseDown={onDown} id='drag'>
            <div id='drag-icon'>
              <Icon path={mdiDragHorizontalVariant} className={'icon'} title='Drag to resize' size={1} />
            </div>
          </div>
          <MapDetails pings={filteredPings} unassignedPings={[]} handleShowOverview={handleShowOverview} />
        </Paper>
        {selectedDetail ? (
          <MapOverView
            open={showOverviewModal}
            handleClose={setShowModal}
            type={overviewType}
            detail={selectedDetail}
          />
        ) : null}
        <AddUDF
          title={'Custom Critter Groups'}
          udf_type={eUDFType.critter_group}
          open={showUdfEdit}
          handleClose={(): void => setShowUdfEdit(false)}
        />
      </div>
    </div>
  );
}
