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
import { applyFilter, fillPoint, getLast10Fixes, getUniqueDevicesFromPings, groupFilters, splitPings, getUniqueCritterIDsFromSelectedPings } from 'pages/map/map_helpers';
import MapFilters from 'pages/map/MapFilters';
import MapOverView from 'pages/map/MapOverview';
import React, { useEffect, useRef, useState } from 'react';
import tokml from 'tokml';
import { ICodeFilter } from 'types/code';
import { ITelemetryDetail, ITelemetryPoint, ITelemetryLine, MapRange, OnlySelectedCritters, IUnassignedTelemetryLine } from 'types/map';
import { formatDay, getToday } from 'utils/time';
import { BCTWType } from 'types/common_types';
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

  // pings layer state
  const [tracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Tracks
  const [pingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Pings
  const [latestPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());
  const [latestUPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON());

  // tracks layer state
  const [unassignedPingsLayer] = useState<L.GeoJSON<L.Point>>(new L.GeoJSON()); // Store Unassigned Pings
  const [unassignedTracksLayer] = useState<L.GeoJSON<L.Polyline>>(new L.GeoJSON()); // Store Unassigned Tracks

  // the drawn shapes layer
  let wasDrawing = false;
  const selectedPingsLayer = new L.GeoJSON();
  selectedPingsLayer.options = setupSelectedPings();

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });

  // pings/tracks state is changed when filters are applied, so use these variables for the 'global' state - used in bottom panel
  const [pings, setPings] = useState<ITelemetryPoint[]>([]);
  const [unassignedPings, setUnassignedPings] = useState<ITelemetryPoint[]>([]);
  const [selectedPingIDs, setSelectedPingIDs] = useState<number[]>([]);

  // modal states - overview, export, udf editing
  const [showOverviewModal, setShowModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<ITelemetryDetail>(null);
  const [overviewType, setOverviewType] = useState<BCTWType>();
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showUdfEdit, setShowUdfEdit] = useState<boolean>(false);

  // state tracking whether or not unassigned device layers are shown
  const [showUnassignedLayers, setShowUnassignedLayers] = useState<boolean>(false);

  // filter state
  const [filters, setFilters] = useState<ICodeFilter[]>([]);

  // state for tracking filters that limit map layers
  const [isMapOnlyFilterApplied, setIsMapOnlyFilterApplied] = useState<boolean>(false);
  const [onlySelected, setOnlySelected] = useState<OnlySelectedCritters>({show: false, critter_ids: []});
  const [onlyLastKnown, setOnlyLastKnown] = useState<boolean>(false);
  const [onlyLast10, setOnlyLast10] = useState<boolean>(false);

  // when finished drawing a shape, a click event occurs as the mouse is released.
  // dont want to trigger the basemap click event, which wipes selectedPingIds
  // doing this with usestate is not fast enough
  const handleWasDrawing = (): void => {
    wasDrawing = true;
  }

  /**
   * still not a valid solution as @var {selectedPingIDs} is not in a valid context
   * when this is called, so cant check that its non empty before wiping it. 
   * fixme: when the basemap is clicked it wipes the selected status 
   * from drawn shapes and bottom panel selected rows
   * todo: maybe revert to trying to position the leaflet popup, since it has a proper 
   * close handler?
   */
  const handleBaseMapClick = (): void => {
    if (!wasDrawing) {
      setSelectedPingIDs([]);
      hidePopup();
    }
    wasDrawing = false;
  }

  // store the selection shapes
  const drawnItems = new L.FeatureGroup();

  // fetch the map data
  const {start, end } = range;
  const { isFetching: fetchingPings, isError: isErrorPings, data: fetchedPings } = bctwApi.usePings(start, end);
  const { isError: isErrorUPings, data: fetchedUnassignedPings } = bctwApi.useUnassignedPings(start, end);
  const { isFetching: fetchingTracks, isError: isErrorTracks, data: fetchedTracks } = bctwApi.useTracks(start, end);
  const { isError: isErrorUTracks, data: fetchedUnassignedTracks } = bctwApi.useUnassignedTracks(start, end);

  // refetch pings when start/end times are changed
  useEffect(() => {
    // wipe the attribute panel state on refresh
    setOnlySelected({show: false, critter_ids:[]});
    setSelectedPingIDs([]);
    clearLayers();
  }, [range]);

  // assigned pings
  useEffect(() => {
    const update = (): void => {
      if (fetchedPings && !isErrorPings) {
        // must be called before adding data to pings layer
        setupPingOptions(pingsLayer, handlePointClick);
        setupLatestPingOptions(latestPingsLayer, handlePointClick);
        // re-apply filters
        if (filters.length) {
          applyFiltersToPings(filters, fetchedPings);
        } else {
          setPings(fetchedPings);
        }

        if (isMapOnlyFilterApplied) {
          // filter what's shown on the map, but not the bottom panel
          if (onlySelected.show) {
            const predicate = (l: ITelemetryPoint): boolean => onlySelected.critter_ids.includes(l.properties.critter_id);
            redrawLayers(fetchedPings.filter(predicate));
          } else if (onlyLast10) {
            const { pings, tracks } = getLast10Fixes(fetchedPings, fetchedTracks ?? []);
            redrawPings(pings);
            redrawTracks(tracks);
          } else if (onlyLastKnown) {
            mapRef.current.removeLayer(pingsLayer);
            mapRef.current.removeLayer(tracksLayer);
          } 
        } else if (!filters.length) {
          const { latest, other } = splitPings(fetchedPings);
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
      setUnassignedPings(fetchedUnassignedPings);

      setupUnassignedPings(unassignedPingsLayer, handlePointClick);
      setupLatestPingOptions(latestUPingsLayer, handlePointClick);

      unassignedPingsLayer.addData(fetchedUnassignedPings as any);
      latestUPingsLayer.addData(splitPings(fetchedUnassignedPings, 'collar_id').latest as any);
      // initially hide unassigned points
      if (!showUnassignedLayers) {
        mapRef?.current?.removeLayer(unassignedPingsLayer);
        mapRef?.current?.removeLayer(latestUPingsLayer);
      } else if (filters.length) {
        applyFiltersToUnassignedPings(filters, fetchedUnassignedPings);
      }
    }
  }, [fetchedUnassignedPings]);

  // assigned tracks
  useEffect(() => {
    if (fetchedTracks && !isErrorTracks) {
      setupTracksOptions(tracksLayer, false);
      /* 
        todo: only last 10 fixes is and needs to be handled when pings are updated?
        since pings are what filter the tracks?
      */
      if (filters.length) {
        applyFiltersToTracks(pings);
      } else {
        tracksLayer.addData(fetchedTracks as any);
      }
    }
  }, [fetchedTracks]);

  // unassigned tracks
  useEffect(() => {
    if (fetchedUnassignedTracks && !isErrorUTracks) {
      setupTracksOptions(unassignedTracksLayer, true);
      unassignedTracksLayer.addData(fetchedUnassignedTracks as any);
      // initially hide unassigned points
      if (!showUnassignedLayers) {
        mapRef.current?.removeLayer(unassignedTracksLayer);
        return;
      }
    }
  }, [fetchedTracks]);

  // when one of the map only filters are applied, set the state
  useEffect(() => {
    const b = onlyLast10 || onlyLastKnown || (onlySelected && onlySelected.show);
    setIsMapOnlyFilterApplied(b);
  }, [onlyLast10, onlyLastKnown, onlySelected])

  // initialize the map
  useEffect(() => {
    const updateComponent = (): void => {
      if (!mapRef.current) {
        initMap(mapRef, drawnItems, selectedPingsLayer, tracksLayer, pingsLayer, handleDrawShape, handleBaseMapClick, handleWasDrawing);
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

  // hide or show unattached device layers
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref) {
      return;
    }
    if (showUnassignedLayers) {
      ref.addLayer(unassignedPingsLayer);
      ref.addLayer(unassignedTracksLayer);
      ref.addLayer(latestUPingsLayer);
    } else {
      // fixme: why does this need a delay?
      setTimeout(() => {
        ref.removeLayer(unassignedPingsLayer)
        ref.removeLayer(unassignedTracksLayer);
        ref.removeLayer(latestUPingsLayer);
      }, 100) ;
    }
  }, [showUnassignedLayers])

  // when the selected ping state is changed, call the handler to highlight them
  useDidMountEffect(() => {
    highlightSelected();
  }, [selectedPingIDs]);

  /**
   * when a map point is clicked, 
   * a) populate the popup with metadata
   * b) show or hide the point
   * c) style the point
   */
  const handlePointClick = (event: L.LeafletEvent): void => {
    // dont trigger basemap click that would clear the ping
    L.DomEvent.stopPropagation(event);
    const layer = event.target;
    setSelectedPingIDs([]);
    const feature: ITelemetryPoint = layer?.feature;
    setPopupInnerHTML(feature);
    // set the feature id state so bottom panel will highlight the row
    setSelectedPingIDs([feature.id]);
  };

  // when rows are checked in the details panel, highlight them
  // fixme: the highlight fill color is reset when new data is fetched
  const handleDetailPaneRowSelect = (pingIds: number[]): void => {
    hidePopup();
    setSelectedPingIDs([...pingIds]);
  };

  /**
   * triggerd when @var {selectedPingIDs} is changed
   * fills the selected pings with the 'seelcted' colour
   */
  const highlightSelected = (): void => {
    mapRef.current.eachLayer((layer: L.Polygon) => {
      const feature = layer.feature;
      if (feature )  {
        const id = feature.id as number;
        if (selectedPingIDs.includes(id)) {
          fillPoint(layer, true);
        } else {
          fillPoint(layer);
        }
      }
    });
  }

  // handles the drawing and deletion of shapes, setup in map_init
  const handleDrawShape = (): void => {
    hidePopup();
    const clipper = drawnItems.toGeoJSON();
    const allPings = pingsLayer.toGeoJSON();
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);
    const ids = [...overlay.features.map(f => f.id) as any]
    setSelectedPingIDs(ids);
  };
  
  // clears existing pings/tracks layers
  const clearLayers = (): void => {
    const layerPicker = L.control.layers();
    const allLayers = [...getAssignedLayers(), ...getUnassignedLayers()];
    allLayers.forEach(l => {
      layerPicker.removeLayer(l);
      if (typeof (l as L.GeoJSON).clearLayers === 'function') {
        (l as L.GeoJSON).clearLayers();
      }
    })
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
    if (showUnassignedLayers && fetchedUnassignedPings && fetchedUnassignedTracks) {
      const { latest, other } = splitPings(fetchedUnassignedPings, 'collar_id');
      unassignedTracksLayer.addData(fetchedUnassignedTracks as any);
      unassignedPingsLayer.addData(other as any);
      latestUPingsLayer.addData(latest as any);
    }
  };

  // redraw only pings, if no params supplied it will default the fetched ones
  const redrawPings = (newPings: ITelemetryPoint[]): void => {
    const { latest, other } = splitPings(newPings);
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(pingsLayer);
    layerPicker.removeLayer(latestPingsLayer);
    pingsLayer.clearLayers();
    latestPingsLayer.clearLayers();
    pingsLayer.addData(other as any);
    latestPingsLayer.addData(latest as any);
    selectedPingIDs.forEach(f => fillPoint(f, true));
  }

  const redrawUnassignedPings = (upings = fetchedUnassignedPings): void => {
    const { latest, other } = splitPings(upings, 'critter_id');
    const layerPicker = L.control.layers();

    layerPicker.removeLayer(unassignedPingsLayer);
    layerPicker.removeLayer(latestUPingsLayer);

    unassignedPingsLayer.clearLayers();
    latestUPingsLayer.clearLayers();

    unassignedPingsLayer.addData(other as any);
    latestUPingsLayer.addData(latest as any);
  }

  // redraw only tracks
  const redrawTracks = (newTracks: ITelemetryLine[]): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(tracksLayer);
    tracksLayer.clearLayers();
    tracksLayer.addData(newTracks as any);
  }

  const redrawUnassignedTracks = (ut: IUnassignedTelemetryLine[]): void => {
    const layerPicker = L.control.layers();
    layerPicker.removeLayer(unassignedTracksLayer);
    unassignedTracksLayer.clearLayers();
    unassignedTracksLayer.addData(ut as any);
  }

  // triggered when side-panel filters are applied
  const handleApplyChangesFromFilterPanel = (newRange: MapRange, filters: ICodeFilter[]): void => {
    // if the timerange was changed, update that first. will trigger refetch
    if (newRange.start !== range.start || newRange.end !== range.end) {
      setRange(newRange);
    }
    // otherwise, update the filter state and apply the filters
    setFilters(filters);
    applyFiltersToPings(filters);
    if (showUnassignedLayers) {
      applyFiltersToUnassignedPings(filters)
    }
  };

  // the handler that actually updates the ping state when the filter state is changed
  const applyFiltersToPings = (filters: ICodeFilter[], newFeatures = pings): void => {
    if (!filters.length) {
      // reset map state and bottom panel state
      setPings(fetchedPings)
      redrawLayers();
      return;
    }
    const groupedFilters = groupFilters(filters);
    const filteredPings = applyFilter(groupedFilters, newFeatures);

    setPings(filteredPings);
    redrawPings(filteredPings);

    applyFiltersToTracks(filteredPings);
  }

  const applyFiltersToUnassignedPings = (filters: ICodeFilter[], upings = fetchedUnassignedPings): void => {
    if (!filters.length) {
      setUnassignedPings(upings);
      redrawLayers();
      return;
    }
    const deviceIDFilter = groupFilters(filters).filter(gf => gf.code_header === 'device_id');

    if (deviceIDFilter.length ) {
      const filteredUPings = applyFilter(deviceIDFilter, fetchedUnassignedPings);
      setUnassignedPings(filteredUPings);
      redrawUnassignedPings(filteredUPings);
      applyFiltersToUnassignedTracks(filteredUPings);
    }
  }

  /**
   * in order to know what tracks need to be updated, the filters need to be applied to pings first,
   * because that will determine which critters are displayed
   * this function will be triggered when @var {critterIDsDisplayed} is changed
   */
  const applyFiltersToTracks = (p = pings): void => {
    if (!fetchedTracks) {
      return;
    }
    const uniqueCritterIDs = getUniqueCritterIDsFromSelectedPings(p, pings.map(p => p.id))
    const filteredTracks = fetchedTracks.filter(t => uniqueCritterIDs.includes(t.properties.critter_id));
    redrawTracks(filteredTracks);
  }

  const applyFiltersToUnassignedTracks = (up = unassignedPings): void => {
    if (!fetchedUnassignedTracks) {
      return;
    }
    const uniqueDeviceIDs = getUniqueDevicesFromPings(up);
    // note: as IUnassignedTelemetryLine
    const filteredTracks = (fetchedUnassignedTracks as any).filter((t) => uniqueDeviceIDs.includes(t.properties.collar_id));
    redrawUnassignedTracks(filteredTracks);
  }

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
   */
  // fixme: points within drawn polygons are still displayed
  const handleShowLastKnownLocation = (show: boolean): void => {
    setOnlyLastKnown(show);
    if (show) {
      mapRef.current.removeLayer(pingsLayer);
      mapRef.current.removeLayer(tracksLayer);
      if (showUnassignedLayers) {
        mapRef.current.removeLayer(unassignedPingsLayer);
        mapRef.current.removeLayer(unassignedTracksLayer);
      }
    } else {
      mapRef.current.addLayer(pingsLayer);
      mapRef.current.addLayer(tracksLayer);
      if (showUnassignedLayers) {
        mapRef.current.addLayer(unassignedPingsLayer);
        mapRef.current.addLayer(unassignedTracksLayer);
      }
    }
  };

  /**
   * @param b boolean on whether the map should be filtered to each critter's last 10 pings
   * fixme: line segment to the latest point not appearing
   */
  const handleShowLast10Fixes = (b: boolean): void => {
    setOnlyLast10(b);
    if (!b) {
      redrawLayers();
      return;
    }
    const { pings, tracks } = getLast10Fixes(fetchedPings, fetchedTracks);
    redrawPings(pings);
    redrawTracks(tracks);
  }

  // only show critters selected in map details in the map
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
  const getUnassignedLayers = (): L.Layer[] => [unassignedPingsLayer, latestUPingsLayer, unassignedTracksLayer];

  /**
   * when device assignment status select dropdown is changed
   * show or hide layers depending on what was selected
   */
  const handleShowUnassignedDevices = (o: ISelectMultipleData[]): void => {
    const values = o.map(s => s.value);
    // setting this state will trigger visibility of unassigned layers
    setShowUnassignedLayers(values.includes(MapStrings.assignmentStatusOptionU));

    const ref = mapRef.current;
    const layers = [0, 2].includes(values.length) ? [...getAssignedLayers(), ...getUnassignedLayers()] : getAssignedLayers();

    // when all or no options are selected
    if (layers.length > 3) { // ie - we are showing/hiding all layers
      if (values.length === 2) { // show all was selected
        layers.forEach(l => ref.addLayer(l));
      } else if (values.length === 0) { // hide all was selected
        layers.forEach(l => ref.removeLayer(l));
      }
      return;
    }
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

  return (
    <div id={'map-view'} onMouseUp={onUp} onMouseMove={onMove}>
      <MapFilters
        start={range.start}
        end={range.end}
        uniqueDevices={getUniqueDevicesFromPings(fetchedPings ?? [])}
        unassignedDevices={showUnassignedLayers ? getUniqueDevicesFromPings(fetchedUnassignedPings ?? []) : []}
        onApplyFilters={handleApplyChangesFromFilterPanel}
        onClickEditUdf={(): void => setShowUdfEdit(o => !o)}
        onShowLatestPings={handleShowLastKnownLocation}
        onShowLastFixes={handleShowLast10Fixes}
        onShowUnassignedDevices={handleShowUnassignedDevices}
      />
      <div className={'map-container'}>
        {fetchingPings || fetchingTracks ? <CircularProgress className='progress' color='secondary' /> : null}
        <div id='popup' style={{bottom: bottomPanelHeight}}/>
        <div id='map' onKeyDown={handleKeyPress} />
        <div style={{height: bottomPanelHeight}} className={`bottom-panel ${showOverviewModal || showExportModal || showUdfEdit ? '' : 'appear-above-map'}`}>
          <div onMouseDown={onDown} id='drag'></div>
          <MapDetails 
            pings={[...pings]}
            unassignedPings={showUnassignedLayers ? [...unassignedPings] : []}
            selectedAssignedIDs={selectedPingIDs}
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
