import * as L from 'leaflet';
import {
  getFillColorByStatus,
  getOutlineColor,
  MAP_COLOURS,
  MAP_COLOURS_OUTLINE,
  parseAnimalColour
} from 'pages/map/map_helpers';
import { ITelemetryPoint } from 'types/map';

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
        // e.target.setStyle({ ...e.target.prevStyle, fillOpacity: e.target.prevStyle.opacity });
      });
      marker.on('click', (e) => {
        clickHandler(e);
        // e.target.setStyle(selectedPointStyle());
      });
      return marker;
    }
  };
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
  createLatestPingIcon,
  defaultPointStyle,
  setupSelectedPings,
  setupLatestPingOptions,
  setupTracksOptions,
  setupPingOptions,
  getStyle,
  selectedPointStyle,
  animalColoredPointStyle
};
