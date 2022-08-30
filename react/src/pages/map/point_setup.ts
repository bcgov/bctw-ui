import * as L from 'leaflet';
import {
  getFillColorByStatus,
  getOutlineColor,
  MAP_COLOURS,
  MAP_COLOURS_OUTLINE,
  parseAnimalColour
} from 'pages/map/map_helpers';
import { DEFAULT_MFV, ITelemetryPoint, MapFormValue } from 'types/map';

export type Colour = {
  fillColor: string;
  color: string;
};

const defaultPointStyle: L.CircleMarkerOptions = {
  radius: 8,
  weight: 1,
  opacity: 0.8,
  fillOpacity: 0.9
};

const selectedPointStyle = (): L.CircleMarkerOptions => {
  return {
    fillColor: MAP_COLOURS.selected,
    color: MAP_COLOURS_OUTLINE.selected,
    ...defaultPointStyle
  };
};

const animalColoredPointStyle = (ping: ITelemetryPoint): L.CircleMarkerOptions => {
  const fillColor = getFillColorByStatus(ping);
  const color = getOutlineColor(ping);
  return {
    ...defaultPointStyle,
    fillColor,
    color
  };
};

const getColors = (event: L.LeafletEvent): Colour => {
  const obj = event.sourceTarget.options;
  const { color, fillColor } = obj?.color ? obj : parseAnimalColour(obj.icon.options.attribution);
  return { color, fillColor };
};

const createLatestPingIcon = (fillColor: string, color = '#000'): L.DivIcon => {
  return L.divIcon({
    html: `
    <div
      style="
      height: 24px;
      width: 24px;
      margin-top: -6px;
      margin-left: -6px;"
      >
    <svg      
      viewBox="0 0 24 24" 
      id="star_filled" 
      data-name="star 
      filled" xmlns="http://www.w3.org/2000/svg"
      >

    <path 
      id="Star" 
      d="M10,15,4.122,18.09l1.123-6.545L.489,6.91l6.572-.955L10,0l2.939,5.955,6.572.955-4.755,4.635,1.123,6.545Z" 
      transform="translate(2 3)" 
      
      stroke="${color}" 
      fill="${fillColor}" 
      stroke-miterlimit="10" 
      stroke-width="1.5"/>

    </svg>
    </div>
    `,
    className: 'latest-ping',
    attribution: `${fillColor},${color}`
  });
};

const latestSelectedPingIcon = createLatestPingIcon(MAP_COLOURS.selected);
// setup for the latest pings for assigned devices
// the icon is replaced when the marker is clicked
const setupLatestPingOptions = (
  pings: L.GeoJSON,
  clickHandler: L.LeafletEventHandlerFn,
  closeHandler: L.LeafletEventHandlerFn
): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const unselectedIcon = createLatestPingIcon(getFillColorByStatus(feature), getOutlineColor(feature));
      const marker = new L.Marker(latlng, { icon: unselectedIcon });
      // make a hidden popup that will help deal with click events
      marker.bindPopup('', { className: 'marker-popup' }).openPopup();
      marker.on('popupclose', (e) => {
        closeHandler(e);
        const { color, fillColor } = e.target.prevColours;
        e.target.setIcon(createLatestPingIcon(fillColor, color));
      });
      marker.on('click', (e) => {
        clickHandler(e);
        e.target.setIcon(latestSelectedPingIcon);
      });
      return marker;
    }
  };
};

// setup for normal pings for assigned devices
// when a ping is clicked/unselected, only the point style is changed
const setupPingOptions = (
  pings: L.GeoJSON,
  clickHandler: L.LeafletEventHandlerFn,
  closeHandler: L.LeafletEventHandlerFn
): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const critterStyle = animalColoredPointStyle(feature);
      const marker = L.circleMarker(latlng, critterStyle);
      marker.bindPopup('', { className: 'marker-popup' }).openPopup();
      marker.on('popupclose', (e) => {
        closeHandler(e);
        e.target.setStyle(e.target.prevColours);
      });
      marker.on('click', (e) => {
        clickHandler(e);
        e.target.setStyle(selectedPointStyle());
      });
      return marker;
    }
  };
};
const highlightLatestPings = (layer: L.GeoJSON, selectedIDs: number[]): void => {
  layer.eachLayer((p: any) => {
    const feature = p.feature;
    if (typeof p.setIcon === 'function') {
      if (selectedIDs.includes(feature.id)) {
        p.setIcon(latestSelectedPingIcon);
      } else {
        p.setIcon(createLatestPingIcon(getFillColorByStatus(feature), getOutlineColor(feature)));
      }
    }
  });
};

const highlightPings = (layer: L.GeoJSON, selectedIDs: number[]): void => {
  layer.eachLayer((p: any) => {
    const feature = p.feature;
    if (typeof p.setStyle === 'function') {
      p.setStyle({
        weight: 1.0,
        color: getOutlineColor(feature),
        fillColor: getFillColorByStatus(feature, selectedIDs.includes(feature.id))
      });
    }
  });
};

const getSymbolizeColours = (mfv: MapFormValue, feature: ITelemetryPoint): { fillColor: string; color: string } => {
  const { header, values } = mfv;
  const isDeviceID = header === DEFAULT_MFV.header;
  const attr = feature.properties[header as string];
  const fillColor = values.find((val) => val.id === attr)?.colour;
  const color = isDeviceID ? getOutlineColor(feature) : MAP_COLOURS.outline;
  return { fillColor, color };
};

const symbolizePings = (layer: L.GeoJSON, mfv: MapFormValue, includeLatest: boolean): void => {
  layer.eachLayer((p: any) => {
    const { color, fillColor } = getSymbolizeColours(mfv, p.feature);
    if (typeof p.setStyle === 'function' && color && fillColor) {
      p.setStyle({
        weight: 1.0,
        color,
        fillColor
      });
    }
    if (typeof p.setIcon === 'function') {
      const { fillColor, color } = getSymbolizeColours(mfv, p.feature);
      includeLatest
        ? p.setIcon(createLatestPingIcon(fillColor, color))
        : p.setIcon(createLatestPingIcon(getFillColorByStatus(p.feature), getOutlineColor(p.feature)));
    }
  });
};

// tracks setup
const setupTracksOptions = (tracks: L.GeoJSON): void => {
  const color = MAP_COLOURS.track;
  tracks.options = {
    style: (): Record<string, string> => {
      return {
        weight: '2.0',
        color
      };
    }
  };
  tracks.setZIndex(0);
};

// setup for pings within a drawn shape (ex. polygon)
const setupSelectedPings = (): L.GeoJSONOptions => {
  return {
    pointToLayer: (feature, latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        fillColor: MAP_COLOURS.selected,
        ...defaultPointStyle
      };
      return L.circleMarker(latlng, pointStyle);
    }
  };
};

export {
  highlightPings,
  highlightLatestPings,
  createLatestPingIcon,
  defaultPointStyle,
  setupSelectedPings,
  setupLatestPingOptions,
  setupTracksOptions,
  setupPingOptions,
  symbolizePings,
  getColors,
  selectedPointStyle
};
