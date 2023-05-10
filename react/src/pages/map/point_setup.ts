import * as L from 'leaflet';
import {
  getFillColorByStatus,
  getOutlineColor,
  MAP_COLOURS,
  MAP_COLOURS_OUTLINE,
  parseAnimalColour
} from 'pages/map/map_helpers';
import { DEFAULT_MFV, ITelemetryPoint, MapFormValue } from 'types/map';

export type PointStyle = {
  fillColor: string;
  color: string;
  opacity: number;
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

const animalColoredPointStyle = (
  ping: ITelemetryPoint,
  colorHandler?: (p: ITelemetryPoint, s?: boolean) => string
): L.CircleMarkerOptions => {
  if (!colorHandler) colorHandler = getFillColorByStatus;
  const fillColor = colorHandler(ping);
  const color = getOutlineColor(ping);
  return {
    ...defaultPointStyle,
    fillColor,
    color
  };
};

const getStyle = (event: L.LeafletEvent): PointStyle => {
  const obj = event.sourceTarget.options;
  if (obj?.color) {
    const { color, fillColor, opacity } = obj;
    return { color, fillColor, opacity };
  } else {
    const [color, fillColor, opacity] = obj.icon.options.attribution.split(' ');
    return { color, fillColor, opacity };
  }
  // const { color, fillColor, opacity } = obj?.color ? obj : obj.icon.options.attribution.split(' ');
  // console.log(color, fillColor, opacity);
  // return { color, fillColor, opacity };
};

const createLatestPingIcon = (fillColor: string, color = '#000', opacity = defaultPointStyle.opacity): L.DivIcon => {
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
      fill-opacity="${opacity}"
      opacity="${opacity}"
      stroke-miterlimit="10" 
      stroke-width="1.5"/>

    </svg>
    </div>
    `,
    className: 'latest-ping',
    attribution: `${color} ${fillColor} ${opacity}`
  });
};

const latestSelectedPingIcon = createLatestPingIcon(MAP_COLOURS.selected);
// setup for the latest pings for assigned devices
// the icon is replaced when the marker is clicked
const setupLatestPingOptions = (
  pings: L.GeoJSON,
  clickHandler: L.LeafletEventHandlerFn,
  closeHandler: L.LeafletEventHandlerFn,
  colorHandler?: (p: ITelemetryPoint, s?: boolean) => string
): void => {
  if (!colorHandler) {
    colorHandler = getFillColorByStatus;
  }
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const unselectedIcon = createLatestPingIcon(colorHandler(feature), getOutlineColor(feature));
      const marker = new L.Marker(latlng, { icon: unselectedIcon });
      const enableClick = () => {
        marker.once('click', (e) => {
          clickHandler(e);
          e.target.setIcon(latestSelectedPingIcon);
        });
      };
      // make a hidden popup that will help deal with click events
      marker.bindPopup('', { className: 'marker-popup' }).openPopup();
      marker.on('popupclose', (e) => {
        // marker can only be clicked once, re-enabled after pop-up closes
        enableClick();
        closeHandler(e);
        e.target.setIcon(unselectedIcon);
      });
      enableClick();
      return marker;
    }
  };
};

// setup for normal pings for assigned devices
// when a ping is clicked/unselected, only the point style is changed
const setupPingOptions = (
  pings: L.GeoJSON,
  clickHandler: L.LeafletEventHandlerFn,
  closeHandler: L.LeafletEventHandlerFn,
  colorHandler?: (p: ITelemetryPoint, s?: boolean) => string
): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const critterStyle = animalColoredPointStyle(feature, colorHandler);
      const marker = L.circleMarker(latlng, critterStyle);
      marker.bindPopup('', { className: 'marker-popup' }).openPopup();
      marker.on('popupclose', (e) => {
        closeHandler(e);
        e.target.setStyle({ ...e.target.prevStyle, fillOpacity: e.target.prevStyle.opacity });
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
  // TODO: Support symbolize with non-exclusive data
  const prop = feature.properties;
  const attr = prop[header] ? (Array.isArray(prop[header]) ? prop[header][0] : prop[header]) : undefined;
  const fillColor = values.find((val) => val.id === attr)?.colour;
  const color = isDeviceID ? getOutlineColor(feature) : MAP_COLOURS.outline;
  return { fillColor, color };
};

const symbolizePings = (layer: L.GeoJSON, mfv: MapFormValue, includeLatest: boolean, opacity: number): void => {
  layer.eachLayer((p: any) => {
    const { color, fillColor } = getSymbolizeColours(mfv, p.feature);
    if (typeof p.setStyle === 'function' && color && fillColor) {
      p.setStyle({
        weight: 1.0,
        color,
        fillColor,
        opacity,
        fillOpacity: opacity
      });
    }
    if (typeof p.setIcon === 'function') {
      const { fillColor, color } = getSymbolizeColours(mfv, p.feature);
      includeLatest
        ? p.setIcon(createLatestPingIcon(fillColor, color, opacity))
        : p.setIcon(createLatestPingIcon(getFillColorByStatus(p.feature), getOutlineColor(p.feature), opacity));
    }
  });
};

// tracks setup
const setupTracksOptions = (tracks: L.GeoJSON): void => {
  tracks.options = {
    style: (feature: ITelemetryPoint) => {
      const { fillColor } = parseAnimalColour(feature.properties.map_colour);
      return {
        color: fillColor,
        weight: 2.0
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
  getStyle,
  selectedPointStyle
};
