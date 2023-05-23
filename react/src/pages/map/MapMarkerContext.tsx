import React, { createContext, useReducer, useContext } from 'react';
import { MAP_COLOURS, MAP_COLOURS_OUTLINE, getFillColorByStatus, parseAnimalColour } from './map_helpers';
import { createLatestPingIcon } from './point_setup';

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
  | { type: 'SELECT_MARKER'; id: number | string }
  | { type: 'SELECT_MARKERS'; ids: (number | string)[] }
  | { type: 'UNSELECT_MARKERS'; ids: (number | string)[] }
  | { type: 'SELECT_CRITTERS'; ids: string[] }
  | { type: 'FOCUS_CRITTER'; id: string }
  | { type: 'SYMBOLIZE_GROUP'; group: { id: string; color: string; applyToLatest: boolean } }
  | { type: 'SET_OPACITY'; val: number }
  | { type: 'RESET_SELECTION' }
  | { type: 'RESET_FOCUS' }
  | { type: 'RESET_SYMBOLIZE' };

const MapMarkerContext = createContext<[MarkerState, React.Dispatch<MarkerAction>] | undefined>(undefined);

const markerReducer = (markerState: MarkerState, action: MarkerAction): MarkerState => {
  switch (action.type) {
    case 'SET_MARKERS':
      return { ...markerState, markers: action.markers };

    case 'SELECT_MARKER':
      return {
        ...markerState,
        selectedMarkers: new Set([...markerState.selectedMarkers, action.id])
      };

    case 'SELECT_MARKERS':
      return {
        ...markerState,
        selectedMarkers: new Set([...markerState.selectedMarkers, ...action.ids])
      };

    case 'UNSELECT_MARKERS':
      return {
        ...markerState,
        selectedMarkers: new Set([...markerState.selectedMarkers].filter((id) => !action.ids.includes(id)))
      };

    case 'SELECT_CRITTERS':
      return { ...markerState, selectedCritters: action.ids };

    case 'FOCUS_CRITTER':
      return { ...markerState, focusedCritter: action.id };

    case 'SYMBOLIZE_GROUP':
      return {
        ...markerState,
        symbolizedGroups: {
          ...markerState.symbolizedGroups,
          [action.group.id]: { color: action.group.color, applyToLatest: action.group.applyToLatest }
        }
      };

    case 'SET_OPACITY':
      return { ...markerState, opacity: action.val };

    case 'RESET_SELECTION':
      return { ...markerState, selectedMarkers: new Set() };

    case 'RESET_FOCUS':
      return { ...markerState, focusedCritter: null };

    case 'RESET_SYMBOLIZE':
      return { ...markerState, symbolizedGroups: {} };

    default:
      return markerState;
  }
};

export const MarkerProvider: React.FC = ({ children }) => {
  const [markerState, markerDispatch] = useReducer(markerReducer, {
    markers: [],
    opacity: 0.9,
    selectedMarkers: new Set() as Set<string | number>,
    selectedCritters: [],
    focusedCritter: null,
    symbolizedGroups: {}
  });

  return <MapMarkerContext.Provider value={[markerState, markerDispatch]}>{children}</MapMarkerContext.Provider>;
};

export const useMarkerStates = (): [MarkerState, React.Dispatch<MarkerAction>] => {
  const context = useContext(MapMarkerContext);
  if (!context) {
    throw new Error('useMarkerStates must be used within a MapProvider');
  }
  return context;
};

export const createMarkersState = (tracks: L.GeoJSON, pings: L.GeoJSON, latestPings: L.GeoJSON): Marker[] => {
  const markerData: Marker[] = [];
  tracks.eachLayer((track: any) => {
    const color = { ...parseAnimalColour(track.feature.properties.map_colour), opacity: 0.9 };
    markerData.push({
      id: track.feature.properties.critter_id,
      critter_id: track.feature.properties.critter_id,
      type: 'Polyline',
      baseColor: color,
      currentColor: color,
      markerRef: track
    });
  });
  pings.eachLayer((ping: any) => {
    const color = {
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color,
      opacity: 0.9
    };
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'CircleMarker',
      baseColor: color,
      currentColor: color,
      markerRef: ping
    });
  });
  latestPings.eachLayer((ping: any) => {
    const color = {
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color,
      opacity: 0.9
    };
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'Divicon',
      baseColor: color,
      currentColor: color,
      markerRef: ping
    });
  });

  return markerData;
};


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
 * This function updates the styles of all map layers based on the current marker states.
 *
 * @param {MarkerState} markerStates - The current states of the map markers.
 */
export const updateLayers = (markerStates: MarkerState): void => {
  const { markers, symbolizedGroups, selectedMarkers, focusedCritter, opacity } = markerStates;

  const isSymbolized = (marker): boolean =>
    symbolizedGroups[marker.critter_id] &&
    (marker.type === 'CircleMarker' ||
      (marker.type === 'Divicon' && symbolizedGroups[marker.critter_id]?.applyToLatest));

  const isHighlight = (marker): boolean => focusedCritter === marker.critter_id || selectedMarkers.has(marker.id);

  const isHidden = (marker): boolean => focusedCritter && focusedCritter !== marker.critter_id;

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
