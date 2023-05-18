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

type State = {
  markers: Marker[];
  opacity: number;
  selectedMarkers: number[]; // ids of selected markers
  selectedCritters: string[];
  focusedAnimal: string | null;
  symbolizedGroups: Record<string, { color: string; applyToLatest: boolean }>; // critter_id: color
};

type Action =
  | { type: 'SET_MARKERS'; markers: Marker[] }
  | { type: 'SELECT_MARKER'; id: number }
  | { type: 'SELECT_MARKERS'; ids: number[] }
  | { type: 'UNSELECT_MARKERS'; ids: number[] }
  | { type: 'SELECT_CRITTERS'; ids: string[] }
  | { type: 'FOCUS_ANIMAL'; id: string }
  | { type: 'SYMBOLIZE_GROUP'; group: { id: string; color: string; applyToLatest: boolean } }
  | { type: 'SET_OPACITY'; val: number }
  | { type: 'RESET_SELECTION' }
  | { type: 'RESET_FOCUS' }
  | { type: 'RESET_SYMBOLIZE' };

const MapContext = createContext<[State, React.Dispatch<Action>] | undefined>(undefined);

const mapReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_MARKERS':
      return { ...state, markers: action.markers };

    case 'SELECT_MARKER':
      return { ...state, selectedMarkers: state.selectedMarkers.concat([action.id]) };

    case 'SELECT_MARKERS':
      return { ...state, selectedMarkers: state.selectedMarkers.concat(action.ids) };

    case 'UNSELECT_MARKERS':
      return {
        ...state,
        selectedMarkers: state.selectedMarkers.filter((id) => !action.ids.includes(id))
      };

    case 'SELECT_CRITTERS':
      return { ...state, selectedCritters: action.ids };

    case 'FOCUS_ANIMAL':
      return { ...state, focusedAnimal: action.id };

    case 'SYMBOLIZE_GROUP':
      return {
        ...state,
        symbolizedGroups: {
          ...state.symbolizedGroups,
          [action.group.id]: { color: action.group.color, applyToLatest: action.group.applyToLatest }
        }
      };

    case 'SET_OPACITY':
      return { ...state, opacity: action.val };

    case 'RESET_SELECTION':
      return { ...state, selectedMarkers: [] };

    case 'RESET_FOCUS':
      return { ...state, focusedAnimal: null };

    case 'RESET_SYMBOLIZE':
      return { ...state, symbolizedGroups: {} };

    default:
      return state;
  }
};

export const MarkerProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, {
    markers: [],
    opacity: 0.9,
    selectedMarkers: [],
    selectedCritters: [],
    focusedAnimal: null,
    symbolizedGroups: {}
  });

  return <MapContext.Provider value={[state, dispatch]}>{children}</MapContext.Provider>;
};

export const useMapState = (): [State, React.Dispatch<Action>] => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
};

export const createMarkers = (tracks: L.GeoJSON, pings: L.GeoJSON, latestPings: L.GeoJSON): Marker[] => {
  const markerData: Marker[] = [];
  tracks.eachLayer((track: any) => {
    markerData.push({
      id: track.feature.id,
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
  state: State,
  layers: (L.GeoJSON<L.Polyline<LineString | MultiLineString, any>> | L.GeoJSON<L.Point>)[]
): void => {
  const { markers, symbolizedGroups, selectedMarkers, focusedAnimal, opacity } = state;

  // Create a lookup table for markers by id
  const markerLookup = markers.reduce((acc, marker) => {
    acc[marker.id] = marker;
    return acc;
  }, {});

  layers.forEach((layer) => {
    layer.eachLayer((marker: any) => {
      const markerState = markerLookup[(marker as any).feature.id];

      if (!markerState) return;

      let fillColor = markerState.fillColor;
      let outlineColor = markerState.color;
      let position = null;

      if (
        symbolizedGroups[markerState.critter_id] &&
        (markerState.type === 'CircleMarker' ||
          (markerState.type === 'Divicon' && symbolizedGroups[markerState.critter_id].applyToLatest))
      ) {
        fillColor = symbolizedGroups[markerState.critter_id].color; // symbolized color
        outlineColor = MAP_COLOURS.outline;
      }

      if (selectedMarkers.includes(markerState.id)) {
        fillColor = MAP_COLOURS.selected; // selected color
        position = 'front';
      }

      if (focusedAnimal === markerState.critter_id) {
        outlineColor = MAP_COLOURS.selected; // focused color
        position = 'front';
      }

      if (focusedAnimal && focusedAnimal !== markerState.critter_id) {
        fillColor = MAP_COLOURS['unassigned point']; // hidden color
        outlineColor = MAP_COLOURS_OUTLINE['unassigned point'];
        position = 'back';
      }
      if (markerState.type === 'Divicon' && typeof marker.setIcon === 'function') {
        (marker as L.Marker).setIcon(createLatestPingIcon(fillColor, outlineColor, opacity));
      } else if (markerState.type === 'CircleMarker' && typeof marker.setStyle === 'function') {
        (marker as L.CircleMarker).setStyle({
          color: outlineColor,
          fillColor: fillColor,
          opacity,
          fillOpacity: opacity
        });
        if (position)
          position === 'front' ? (marker as L.CircleMarker)?.bringToFront() : (marker as L.CircleMarker)?.bringToBack();
      }
    });
  });
};
