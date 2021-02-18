import * as L from 'leaflet';
// import dayjs from 'dayjs';
// import { formatLocal } from 'utils/time';

const setupPingOptions = (pings: L.GeoJSON, onClickPointHandler: L.LeafletEventHandlerFn): void => {
  pings.options = {
    pointToLayer: (feature, latlng): L.Layer => {
      // Mortality is red
      const s = feature.properties.animal_status;
      const colour = s === 'Mortality' ? '#ff0000' : '#00ff44';

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
    // ,onEachFeature: (feature, layer): void => {
    //   const p = feature.properties;
    //   const g = feature.geometry as any; // Yes... this exists!
    //   const x = g.coordinates[0]?.toFixed(5);
    //   const y = g.coordinates[1]?.toFixed(5);
    //   const t = dayjs(p.date_recorded).format(formatLocal);
    //   const text = `
    //     ${p.species || ''} ${p.animal_id || 'No WLHID'} <br>
    //     <hr>
    //     Device ID ${p.device_id} (${p.device_vendor}) <br>
    //     ${p.radio_frequency ? 'Frequency of ' + p.radio_frequency + '<br>' : ''}
    //     ${p.population_unit ? 'Unit ' + p.population_unit + '<br>' : ''}
    //     ${t} <br>
    //     ${x}, ${y}
    //   `;
    //   layer.bindPopup(text).addEventListener('popupopen', onClickPointHandler);
    // }
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

export { setupPingOptions, setupSelectedPings, addTileLayers };
