import React, { createContext, useReducer, useContext } from 'react';
import { MAP_COLOURS, MAP_COLOURS_OUTLINE, getFillColorByStatus, parseAnimalColour } from './map_helpers';
import { createLatestPingIcon } from './point_setup';
import { ITelemetryPoint } from 'types/map';

type MarkerColor = {
  fillColor: string;
  color: string;
  opacity: number;
};

type Marker = {
  id: number | string;
  critter_id: string;
  baseColor: MarkerColor;
  currentColor: MarkerColor;
  type: 'CircleMarker' | 'Divicon' | 'Polyline';
  markerRef: L.CircleMarker | L.Polyline | L.Marker;
};

type MarkerState = {
  markers: Marker[];
  opacity: number;
  selectedMarkers: Set<number | string>; // ids of selected markers
  selectedCritters: string[];
  focusedCritter: string | null;
  symbolizedGroups: Record<string, { color: string; applyToLatest: boolean }>; // critter_id: color
};

type MarkerAction =
  | { type: 'SET_MARKERS'; markers: Marker[] }
  | { type: 'SELECT_MARKERS'; ids: (number | string)[] }
  | { type: 'UNSELECT_MARKERS'; ids: (number | string)[] }
  | { type: 'SELECT_CRITTERS'; ids: string[] }
  | { type: 'FOCUS_CRITTER'; id: string }
  | { type: 'SYMBOLIZE_GROUP'; group: { id: string; color: string; applyToLatest: boolean } }
  | { type: 'SET_OPACITY'; val: number }
  | { type: 'RESET_SELECTION' }
  | { type: 'RESET_FOCUS' }
  | { type: 'RESET_SYMBOLIZE' }
  | { type: 'RESET_ALL' };

/**
 * React context for managing state related to map markers.
 */
const MapMarkerContext = createContext<[MarkerState, React.Dispatch<MarkerAction>] | undefined>(undefined);

/**
 * Reducer for handling changes to marker state.
 *
 * @param {MarkerState} markerState - The current state of the markers.
 * @param {MarkerAction} action - An action object describing the changes to apply.
 * @returns {MarkerState} The new marker state.
 */
const markerReducer = (markerState: MarkerState, action: MarkerAction): MarkerState => {
  switch (action.type) {
    // Initialize the marker states
    case 'SET_MARKERS':
      return { ...markerState, markers: action.markers };

    // Adds an array of markers to the selection
    case 'SELECT_MARKERS':
      return {
        ...markerState,
        selectedMarkers: new Set([...markerState.selectedMarkers, ...action.ids])
      };

    // Unselect 1 or many markers
    case 'UNSELECT_MARKERS':
      return {
        ...markerState,
        selectedMarkers: new Set([...markerState.selectedMarkers].filter((id) => !action.ids.includes(id)))
      };

    // Selects a critter_id (will apply to all markers w/ that id)
    case 'SELECT_CRITTERS':
      return { ...markerState, selectedCritters: action.ids };

    // Selects a critter_id for row-hover effects
    case 'FOCUS_CRITTER':
      return { ...markerState, focusedCritter: action.id };

    // Sets symbolize colors
    case 'SYMBOLIZE_GROUP':
      return {
        ...markerState,
        symbolizedGroups: {
          ...markerState.symbolizedGroups,
          [action.group.id]: { color: action.group.color, applyToLatest: action.group.applyToLatest }
        }
      };

    // Set opacity of all markers (doesn't apply to tracks)
    case 'SET_OPACITY':
      return { ...markerState, opacity: action.val };

    // Cases to reset different states
    case 'RESET_SELECTION':
      return { ...markerState, selectedMarkers: new Set() };

    case 'RESET_FOCUS':
      return { ...markerState, focusedCritter: null };

    case 'RESET_SYMBOLIZE':
      return { ...markerState, symbolizedGroups: {} };

    case 'RESET_ALL':
      return initalState;

    default:
      return markerState;
  }
};

const initalState = {
  markers: [],
  opacity: 0.9,
  selectedMarkers: new Set() as Set<string | number>,
  selectedCritters: [],
  focusedCritter: null,
  symbolizedGroups: {}
};

/**
 * Provider component for the Marker context.
 *
 * @param {React.PropsWithChildren<{}>} props - The props to pass to the provider.
 * @returns {React.ReactElement} A React element that provides marker state to its descendants.
 */
export const MarkerProvider: React.FC = ({ children }) => {
  const [markerState, markerDispatch] = useReducer(markerReducer, initalState);

  return <MapMarkerContext.Provider value={[markerState, markerDispatch]}>{children}</MapMarkerContext.Provider>;
};

/**
 * Custom React hook for using the Marker context.
 *
 * @throws {Error} If the hook is not used within a MarkerProvider.
 * @returns {[MarkerState, React.Dispatch<MarkerAction>]} The current marker state and a dispatch function.
 */
export const useMarkerStates = (): [MarkerState, React.Dispatch<MarkerAction>] => {
  const context = useContext(MapMarkerContext);
  if (!context) {
    throw new Error('useMarkerStates must be used within a MapProvider');
  }
  return context;
};

/**
 * Creates the initial state of the markers.
 * TODO: types for eachLayer methods
 *
 * @returns {Marker[]} An array of markers.
 */
type CustomLayer = L.GeoJSON & {
  feature: ITelemetryPoint;
};
export const createMarkersStates = (tracks: L.GeoJSON, pings: L.GeoJSON, latestPings: L.GeoJSON): Marker[] => {
  const markerData: Marker[] = [];
  tracks.eachLayer((track) => {
    const castedTrack = track as CustomLayer;
    const color = { ...parseAnimalColour(castedTrack.feature.properties.map_colour), opacity: 0.9 };
    markerData.push({
      id: castedTrack.feature.properties.critter_id,
      critter_id: castedTrack.feature.properties.critter_id,
      type: 'Polyline',
      baseColor: color,
      currentColor: color,
      markerRef: track as unknown as L.Marker
    });
  });
  pings.eachLayer((ping) => {
    const castedPing = ping as CustomLayer;
    const color = {
      fillColor: getFillColorByStatus(castedPing.feature),
      color: parseAnimalColour(castedPing.feature.properties.map_colour).color,
      opacity: 0.9
    };
    markerData.push({
      id: castedPing.feature.id,
      critter_id: castedPing.feature.properties.critter_id,
      type: 'CircleMarker',
      baseColor: color,
      currentColor: color,
      markerRef: ping as unknown as L.Marker
    });
  });
  latestPings.eachLayer((ping) => {
    const castedPing = ping as CustomLayer;
    const color = {
      fillColor: getFillColorByStatus(castedPing.feature),
      color: parseAnimalColour(castedPing.feature.properties.map_colour).color,
      opacity: 0.9
    };
    markerData.push({
      id: castedPing.feature.id,
      critter_id: castedPing.feature.properties.critter_id,
      type: 'Divicon',
      baseColor: color,
      currentColor: color,
      markerRef: ping as unknown as L.Marker
    });
  });

  return markerData;
};

/**
 * Updates the style of a marker.
 * TODO: toFront / toBack for divicons. This currently doesn't work because 'latestPings' exist on an entirely different layer.
 *
 * @param marker - The marker to update.
 * @param {string} fillColor - The fill color for the marker.
 * @param {string} color - The outline color for the marker.
 * @param {boolean} toFront - Whether to bring the marker to front.
 * @param {number} opacity - The opacity for the marker.
 * @param {'CircleMarker' | 'Divicon' | 'Polyline'} type - The type of the marker.
 */
const updateMarker = (marker, fillColor, color, toFront, opacity, type): void => {
  const markerStyles = {
    CircleMarker: (): void => {
      if (typeof marker.setStyle === 'function') {
        marker.setStyle({
          color: color,
          fillColor: fillColor,
          opacity,
          fillOpacity: opacity
        });
      }
      if (toFront && typeof marker.bringToFront === 'function') {
        marker.bringToFront();
      }
    },
    Divicon: (): void => {
      if (typeof marker.setIcon === 'function') {
        marker.setIcon(createLatestPingIcon(fillColor, color, opacity));
      }
    },
    Polyline: (): void => {
      if (typeof marker.setStyle === 'function') {
        marker.setStyle({ color: fillColor });
      }
    }
  };

  const styleStrategy = markerStyles[type];
  if (styleStrategy) {
    styleStrategy();
  }
};

/**
 * Updates the styles of all map layers based on the current marker states.
 *
 * @param {MarkerState} markerStates - The current states of the map markers.
 */
export const updateLayers = (markerStates: MarkerState): void => {
  const { markers, symbolizedGroups, selectedCritters, selectedMarkers, focusedCritter, opacity } = markerStates;

  const isSymbolized = (marker): boolean =>
    symbolizedGroups[marker.critter_id] &&
    (marker.type === 'CircleMarker' ||
      (marker.type === 'Divicon' && symbolizedGroups[marker.critter_id]?.applyToLatest));

  const isHighlight = (marker): boolean =>
    focusedCritter === marker.critter_id || (selectedMarkers.has(marker.id) && selectedMarkers.size === 1);

  const isHidden = (marker): boolean =>
    focusedCritter &&
    (selectedCritters.length > 0 ? selectedCritters.includes(focusedCritter) : true) &&
    focusedCritter !== marker.critter_id;

  const requiresUpdate = (currentColor, newColor): boolean =>
    currentColor.fillColor !== newColor.fillColor ||
    currentColor.color !== newColor.color ||
    currentColor.opacity !== newColor.opacity;

  markers.forEach((marker) => {
    let { fillColor, color } = marker.baseColor;
    let toFront = false;

    // Apply symbolized styling
    if (isSymbolized(marker)) {
      fillColor = symbolizedGroups[marker.critter_id]?.color; // symbolized color
      color = MAP_COLOURS.outline;
    }

    // Apply selected or row-hovered styling
    if (isHighlight(marker)) {
      color = MAP_COLOURS.selected; // focused color
      toFront = true;
    }

    // Apply greyed-out styling
    if (isHidden(marker)) {
      fillColor = MAP_COLOURS['unassigned point']; // hidden color
      color = MAP_COLOURS_OUTLINE['unassigned point'];
    }

    // Determine if update is needed
    if (requiresUpdate(marker.currentColor, { fillColor, color, opacity })) {
      marker.currentColor = { fillColor, color, opacity };
      updateMarker(marker.markerRef, fillColor, color, toFront, opacity, marker.type);
    }
  });
};
