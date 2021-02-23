import * as L from 'leaflet';
import { ITelemetryFeature } from 'types/map';
// import dayjs from 'dayjs';
// import { formatLocal } from 'utils/time';

const isMortality = (feature: ITelemetryFeature): boolean => feature?.properties?.animal_status === 'Mortality';

const COLORS = {
  dead: '#ff0000',
  normal: '#00ff44',
  selected: '#6495ED'
}

const setupPingOptions = (pings: L.GeoJSON, onClickPointHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature, latlng): L.Layer => {
      // Mortality is red
      const colour = isMortality(feature) ? COLORS.dead : COLORS.normal;
      const pointStyle = {
        radius: 8,
        fillColor: colour,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      };

      const marker = L.circleMarker(latlng, pointStyle);
      // add the event listener
      marker.on('click', onClickPointHandler );
      return marker;
    }
  };
};

const setupSelectedPings = (): L.GeoJSONOptions => {
  return {
    pointToLayer: (feature, latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        radius: 10,
        fillColor: '#ffff00',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      };
      return L.circleMarker(latlng, pointStyle);
    }
  };
};

const addTileLayers = (mapRef: React.MutableRefObject<L.Map>, layerPicker: L.Control.Layers): void => {
  const bingOrtho = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; <a href="https://esri.com">ESRI Basemap</a> ',
      maxZoom: 24,
      maxNativeZoom: 17
    }
  ).addTo(mapRef.current);

  const bcGovBaseLayer = L.tileLayer(
    'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 24,
      attribution: '&copy; <a href="https://www2.gov.bc.ca/gov/content/home">BC Government</a> '
    }
  );
  layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
  layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');
};

export { setupPingOptions, setupSelectedPings, addTileLayers, isMortality, COLORS };
