import * as L from 'leaflet';
import { getFillColorByStatus, getOutlineColor, MAP_COLOURS, MAP_COLOURS_OUTLINE } from 'pages/map/map_helpers';
import { ITelemetryPoint, MapFormValue } from 'types/map';

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

const createLatestPingIcon = (fillColour: string, color = '#000'): L.DivIcon => {
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
      fill="${fillColour}" 
      stroke-miterlimit="10" 
      stroke-width="1.5"/>

    </svg>
    </div>
    `,
    className: 'latest-ping'
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
        e.target.setIcon(unselectedIcon);
        closeHandler(e);
      });
      marker.on('click', (e) => {
        e.target.setIcon(latestSelectedPingIcon);
        clickHandler(e);
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

const highlightPings = (layer: L.GeoJSON, selectedIDs: number[], colour?: string): void => {
  layer.eachLayer((p: any) => {
    const feature = p.feature;
    if (typeof p.setStyle === 'function') {
      p.setStyle({
        weight: 1.0,
        color: getOutlineColor(feature),
        fillColor: colour ? colour : getFillColorByStatus(feature, selectedIDs.includes(feature.id))
      });
    }
  });
};

const symbolizePings = (layer: L.GeoJSON, mfv: MapFormValue): void => {
  const { header, values } = mfv;
  layer.eachLayer((p: any) => {
    const feature = p.feature;
    const attr = feature.properties[header as string];
    const colour = values.find((val) => val.id === attr)?.colour;
    if (typeof p.setStyle === 'function' && colour) {
      p.setStyle({
        weight: 1.0,
        color: getOutlineColor(feature),
        fillColor: colour
      });
    }
  });
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
        e.target.setStyle(critterStyle);
        closeHandler(e);
      });
      marker.on('click', (e) => {
        e.target.setStyle(selectedPointStyle());
        clickHandler(e);
      });
      marker.on('click', clickHandler);
      return marker;
    }
  };
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
  symbolizePings
};
