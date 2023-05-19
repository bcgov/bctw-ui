import React, { createContext, useReducer, useContext } from 'react';
import { MAP_COLOURS, MAP_COLOURS_OUTLINE, getFillColorByStatus, parseAnimalColour } from './map_helpers';
import { LineString, MultiLineString } from 'geojson';
import { createLatestPingIcon } from './point_setup';

type Marker = {
  id: string;
  critter_id: string;
  fillColor: string;
  color: string;
  type: 'CircleMarker' | 'Divicon' | 'Polyline';
};

type MarkerState = {
  markers: Marker[];
  opacity: number;
  selectedMarkers: number[]; // ids of selected markers
  selectedCritters: string[];
  focusedCritter: string | null;
  symbolizedGroups: Record<string, { color: string; applyToLatest: boolean }>; // critter_id: color
};

type MarkerAction =
  | { type: 'SET_MARKERS'; markers: Marker[] }
  | { type: 'SELECT_MARKER'; id: number }
  | { type: 'SELECT_MARKERS'; ids: number[] }
  | { type: 'UNSELECT_MARKERS'; ids: number[] }
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
      return { ...markerState, selectedMarkers: markerState.selectedMarkers.concat([action.id]) };

    case 'SELECT_MARKERS':
      return { ...markerState, selectedMarkers: markerState.selectedMarkers.concat(action.ids) };

    case 'UNSELECT_MARKERS':
      return {
        ...markerState,
        selectedMarkers: markerState.selectedMarkers.filter((id) => !action.ids.includes(id))
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
      return { ...markerState, selectedMarkers: [] };

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
    selectedMarkers: [],
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

export const createMarkers = (tracks: L.GeoJSON, pings: L.GeoJSON, latestPings: L.GeoJSON): Marker[] => {
  const markerData: Marker[] = [];
  tracks.eachLayer((track: any) => {
    markerData.push({
      id: track.feature.properties.critter_id,
      critter_id: track.feature.properties.critter_id,
      type: 'Polyline',
      ...parseAnimalColour(track.feature.properties.map_colour)
    });
  });
  pings.eachLayer((ping: any) => {
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'CircleMarker',
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color
    });
  });
  latestPings.eachLayer((ping: any) => {
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'Divicon',
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color
    });
  });

  return markerData;
};

export const updateLayers = (
  markerState: MarkerState,
  layers: (L.GeoJSON<L.Polyline<LineString | MultiLineString, any>> | L.GeoJSON<L.Point>)[]
): void => {
  const { markers, symbolizedGroups, selectedMarkers, focusedCritter, opacity } = markerState;

  // Create a lookup table for markers by id
  const markerLookup = markers.reduce((acc, marker) => {
    acc[marker.id] = marker;
    return acc;
  }, {});

  layers.forEach((layer) => {
    layer.eachLayer((marker: any) => {
      const state = markerLookup[(marker as any).feature.id ?? (marker as any).feature.properties.critter_id];

      if (!state) return;

      let fillColor = state.fillColor;
      let outlineColor = state.color;
      let position = null;

      if (
        symbolizedGroups[state.critter_id] &&
        (state.type === 'CircleMarker' ||
          (state.type === 'Divicon' && symbolizedGroups[state.critter_id].applyToLatest))
      ) {
        fillColor = symbolizedGroups[state.critter_id].color; // symbolized color
        outlineColor = MAP_COLOURS.outline;
      }

      if (selectedMarkers.includes(state.id)) {
        fillColor = MAP_COLOURS.selected; // selected color
        position = 'front';
      }

      if (focusedCritter === state.critter_id) {
        outlineColor = MAP_COLOURS.selected; // focused color
        position = 'front';
      }

      if (focusedCritter && focusedCritter !== state.critter_id) {
        fillColor = MAP_COLOURS['unassigned point']; // hidden color
        outlineColor = MAP_COLOURS_OUTLINE['unassigned point'];
        position = 'back';
      }
      if (state.type === 'Divicon' && typeof marker.setIcon === 'function') {
        (marker as L.Marker).setIcon(createLatestPingIcon(fillColor, outlineColor, opacity));
      } else if (state.type === 'CircleMarker' && typeof marker.setStyle === 'function') {
        (marker as L.CircleMarker).setStyle({
          color: outlineColor,
          fillColor: fillColor,
          opacity,
          fillOpacity: opacity
        });
        if (position)
          position === 'front' ? (marker as L.CircleMarker)?.bringToFront() : (marker as L.CircleMarker)?.bringToBack();
      } else if (state.type === 'Polyline') {
        (marker as L.Polyline).setStyle({ color: fillColor})
      }
    });
  });
};
