import * as L from 'leaflet';
import { getFillColorByStatus, getOutlineColor, MAP_COLOURS, MAP_COLOURS_OUTLINE } from 'pages/map/map_helpers';
import { ITelemetryPoint } from 'types/map';

const defaultPointStyle: L.CircleMarkerOptions = {
  radius: 8,
  weight: 1,
  opacity: 0.8,
  fillOpacity: 0.9
};

const createLatestPingIcon = (fillColour: string, color = '#000', size = '25px'): L.DivIcon => {
  return L.divIcon({
    html: `<svg width="24px" height="24px" viewBox="0 0 24 24" id="star_filled" data-name="star filled" xmlns="http://www.w3.org/2000/svg"><path id="Star" d="M10,15,4.122,18.09l1.123-6.545L.489,6.91l6.572-.955L10,0l2.939,5.955,6.572.955-4.755,4.635,1.123,6.545Z" transform="translate(2 3)" stroke="${color}" fill="${fillColour}" stroke-miterlimit="10" stroke-width="1.5"/></svg>`,
    className: 'latest-ping'
  });
};

// setup for the latest pings for assigned devices
const setupLatestPingOptions = (pings: L.GeoJSON, clickHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const marker = new L.Marker(latlng, {
        icon: createLatestPingIcon(getFillColorByStatus(feature), getOutlineColor(feature))
      });
      marker.on('click', clickHandler);
      return marker;
    }
  };
};

// setup for normal pings for assigned devices
const setupPingOptions = (pings: L.GeoJSON, clickHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const color = getOutlineColor(feature);
      const fillColor = getFillColorByStatus(feature);
      const pointStyle = { fillColor, color, ...defaultPointStyle };
      const marker = L.circleMarker(latlng, pointStyle);
      // marker.addEventListener('click', clickHandler);
      marker.on('click', clickHandler);
      return marker;
    }
  };
};

const setupUnassignedPings = (pings: L.GeoJSON, clickHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature: ITelemetryPoint, latlng: L.LatLngExpression): L.Layer => {
      const pointStyle = {
        fillColor: MAP_COLOURS['unassigned point'],
        color: MAP_COLOURS_OUTLINE['unassigned point'],
        ...defaultPointStyle
      };
      const marker = L.circleMarker(latlng, pointStyle);
      marker.on('click', clickHandler);
      return marker;
    }
  };
};

// tracks setup
const setupTracksOptions = (tracks: L.GeoJSON, isUnassigned: boolean): void => {
  const color = isUnassigned ? MAP_COLOURS['unassigned line segment'] : MAP_COLOURS.track;
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

// setup for selected pings or pings within a drawn shape (ex. polygon)
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

export { defaultPointStyle, setupSelectedPings, setupUnassignedPings, setupLatestPingOptions, setupTracksOptions, setupPingOptions };
