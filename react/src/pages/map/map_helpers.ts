import * as L from 'leaflet';
import { ITelemetryDetail, ITelemetryFeature, IUniqueFeature } from 'types/map';
// import dayjs from 'dayjs';
// import { formatLocal } from 'utils/time';

const isMortality = (feature: ITelemetryFeature): boolean => feature?.properties?.animal_status === 'Mortality';

const COLORS = {
  dead: '#ff0000',
  normal: '#00ff44',
  selected: '#6495ED'
};

const setupPingOptions = (pings: L.GeoJSON, onClickPointHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature, latlng): L.Layer => {
      // Mortality is red
      const colour = isMortality(feature as any) ? COLORS.dead : COLORS.normal;
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
      marker.on('click', onClickPointHandler);
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


const groupFeaturesByCritters = (features: ITelemetryFeature[]): IUniqueFeature[] => {
  const uniques: IUniqueFeature[] = [];
  // remove (0,0) points
  const filtered = features.filter((f) => {
    const coords = f.geometry.coordinates;
    return coords[0] !== 0 && coords[1] !== 0;
  });
  filtered.forEach((f) => {
    const detail: ITelemetryDetail = f.properties;
    const found = uniques.find((c) => c.critter_id === detail.critter_id);
    if (!found) {
      uniques.push({
        critter_id: detail.critter_id,
        count: 1,
        features: [f]
      });
    } else {
      found.count++;
      found.features.push(f);
    }
  });
  return uniques;
};

const getGroupFeatureCount = (features: IUniqueFeature[]): number => {
  return features.reduce((accum, cur) => accum + cur.count, 0);
};

export {
  setupPingOptions,
  setupSelectedPings,
  addTileLayers,
  isMortality,
  COLORS,
  groupFeaturesByCritters,
  getGroupFeatureCount
};
