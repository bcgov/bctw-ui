import React, { createContext, useReducer, useContext } from 'react';
import { MAP_COLOURS, MAP_COLOURS_OUTLINE, getFillColorByStatus, parseAnimalColour } from './map_helpers';
import { LineString, MultiLineString } from 'geojson';
import { createLatestPingIcon } from './point_setup';
import { Layer } from 'leaflet';

type Marker = {
  id: number | string;
  critter_id: string;
  fillColor: string;
  color: string;
  type: 'CircleMarker' | 'Divicon' | 'Polyline';
  markerRef: Layer;
};

type MarkerState = {
  markers: Marker[];
  // markerLookup: Record<string, Marker>;
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
    // markerLookup: {},
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

export const createMarkers = (tracks: L.GeoJSON, pings: L.GeoJSON, latestPings: L.GeoJSON): Marker[] => {
  const markerData: Marker[] = [];
  tracks.eachLayer((track: any) => {
    markerData.push({
      id: track.feature.properties.critter_id,
      critter_id: track.feature.properties.critter_id,
      type: 'Polyline',
      ...parseAnimalColour(track.feature.properties.map_colour),
      markerRef: track
    });
  });
  pings.eachLayer((ping: any) => {
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'CircleMarker',
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color,
      markerRef: ping
    });
  });
  latestPings.eachLayer((ping: any) => {
    markerData.push({
      id: ping.feature.id,
      critter_id: ping.feature.properties.critter_id,
      type: 'Divicon',
      fillColor: getFillColorByStatus(ping.feature),
      color: parseAnimalColour(ping.feature.properties.map_colour).color,
      markerRef: ping
    });
  });

  return markerData;
};


const updateMarker = (marker, fillColor, color, toFront, opacity, type) => {
  switch (type) {

    case 'CircleMarker':
      if ((toFront || fillColor !== marker.options.fillColor || color !== marker.options.color || opacity !== marker.options.opacity || opacity !== marker.options.fillOpacity) && typeof marker.setStyle === 'function') {
        marker.setStyle({
          color: color,
          fillColor: fillColor,
          opacity,
          fillOpacity: opacity
        });
        toFront? marker.bringToFront() : null
      }
      return

    case 'Divicon': 
      if ((fillColor !== marker.options.fillColor || color !== marker.options.color || opacity !== marker.options.opacity || opacity !== marker.options.fillOpacity) && typeof marker.setIcon === 'function') {
        marker.setIcon(createLatestPingIcon(fillColor, color, opacity));
      }
      return

    case 'Polyline': 
      if (fillColor !== marker.options.color && typeof marker.setStyle === 'function') {
        marker.setStyle({ color: fillColor });
      }
      return
  }
}

export const updateLayers = (markerStates: MarkerState): void => {
  const { markers, symbolizedGroups, selectedMarkers, focusedCritter, opacity } = markerStates;

  markers.forEach((marker) => {
    
      // Default styling
      let fillColor = marker.fillColor;
      let outlineColor = marker.color;
      let toFront = false;

      // Symbolize styling
      if (
        symbolizedGroups[marker.critter_id] &&
        (marker.type === 'CircleMarker' ||
          (marker.type === 'Divicon' && symbolizedGroups[marker.critter_id].applyToLatest))
      ) {
        fillColor = symbolizedGroups[marker.critter_id].color; // symbolized color
        outlineColor = MAP_COLOURS.outline;
      }

      // Selected OR Row-Hovered styling
      if (focusedCritter === marker.critter_id || selectedMarkers.has(marker.id)) {
        outlineColor = MAP_COLOURS.selected; // focused color
        toFront = true;
      }

      // Greyed-out styling
      if (focusedCritter && focusedCritter !== marker.critter_id) {
        fillColor = MAP_COLOURS['unassigned point']; // hidden color
        outlineColor = MAP_COLOURS_OUTLINE['unassigned point'];
      }

      updateMarker(marker.markerRef, fillColor, outlineColor, toFront, opacity, marker.type);
  })
}


// const createMarkerLookup = (markers: Marker[]): Record<string, Marker> => {
//   return markers.reduce((acc, marker) => {
//     acc[marker.id] = marker;
//     return acc;
//   }, {});
// };

// export const updateLayers = (
//   markerStates: MarkerState,
//   layers: (L.GeoJSON<L.Polyline<LineString | MultiLineString, any>> | L.GeoJSON<L.Point>)[]
// ): void => {
//   const { markerLookup, symbolizedGroups, selectedMarkers, focusedCritter, opacity } = markerStates;

//   console.log(markerStates.markers)

//   layers.forEach((layer) => {
//     layer.eachLayer((layerMarker: any) => {
//       const state = markerLookup[(layerMarker as any).feature.id ?? (layerMarker as any).feature.properties.critter_id];

//       if (!state) return;

//       // Default styling
//       let fillColor = state.fillColor;
//       let outlineColor = state.color;
//       let position = null;

//       // Symbolize styling
//       if (
//         symbolizedGroups[state.critter_id] &&
//         (state.type === 'CircleMarker' ||
//           (state.type === 'Divicon' && symbolizedGroups[state.critter_id].applyToLatest))
//       ) {
//         fillColor = symbolizedGroups[state.critter_id].color; // symbolized color
//         outlineColor = MAP_COLOURS.outline;
//       }

//       // Selected OR Row-Hovered styling
//       if (focusedCritter === state.critter_id || selectedMarkers.has(state.id)) {
//         outlineColor = MAP_COLOURS.selected; // focused color
//         position = 'front';
//       }

//       // Greyed-out styling
//       if (focusedCritter && focusedCritter !== state.critter_id) {
//         fillColor = MAP_COLOURS['unassigned point']; // hidden color
//         outlineColor = MAP_COLOURS_OUTLINE['unassigned point'];
//         position = 'back';
//       }

//       // Apply the finalized styling
//       if (state.type === 'Divicon' && typeof layerMarker.setIcon === 'function') {
//         (layerMarker as L.Marker).setIcon(createLatestPingIcon(fillColor, outlineColor, opacity));
//       } else if (state.type === 'CircleMarker' && typeof layerMarker.setStyle === 'function') {
//         (layerMarker as L.CircleMarker).setStyle({
//           color: outlineColor,
//           fillColor: fillColor,
//           opacity,
//           fillOpacity: opacity
//         });
//         if (position)
//           position === 'front'
//             ? (layerMarker as L.CircleMarker)?.bringToFront()
//             : (layerMarker as L.CircleMarker)?.bringToBack();
//       } else if (state.type === 'Polyline') {
//         (layerMarker as L.Polyline).setStyle({ color: fillColor });
//       }
//     });
//   });
// };
