import * as L from 'leaflet';
import dayjs from 'dayjs';
import { formatLocal } from 'utils/time';
import { COLORS, getFillColorByStatus } from 'pages/map/map_helpers';
import React, { createRef, MutableRefObject } from 'react';

const setupPingOptions = (
  pings: L.GeoJSON,
  onClickPointHandler: L.LeafletEventHandlerFn,
  onClosePopupHandler: L.LeafletEventHandlerFn
): void => {
  pings.options = {
    pointToLayer: (feature, latlng): L.Layer => {
      const colour = getFillColorByStatus(feature as any);
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
    },
    onEachFeature: (feature, layer): void => {
      const p = feature.properties;
      const g = feature.geometry as any; // Yes... this exists!
      const x = g.coordinates[0]?.toFixed(5);
      const y = g.coordinates[1]?.toFixed(5);
      const t = dayjs(p.date_recorded).format(formatLocal);
      const text = `
        ${p.species || ''} ${p.animal_id || 'No WLHID'} <br>
        <hr>
        Device ID ${p.device_id} (${p.device_vendor}) <br>
        ${p.radio_frequency ? 'Frequency of ' + p.radio_frequency + '<br>' : ''}
        ${p.population_unit ? 'Unit ' + p.population_unit + '<br>' : ''}
        ${t} <br>
        ${x}, ${y}
      `;
      layer.bindPopup(text).addEventListener('popupopen', onClickPointHandler);
      layer.bindPopup(text).addEventListener('popupclose', onClosePopupHandler);
    }
  };
};

const setupSelectedPings = (): L.GeoJSONOptions => {
  return {
    pointToLayer: (feature, latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        radius: 10,
        fillColor: COLORS.selected,
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

// const initMap = (): void => {
const initMap = (
  mapRef: MutableRefObject<L.Map>,
  drawnItems: L.FeatureGroup,
  selectedPings: L.GeoJSON,
  tracks: L.GeoJSON,
  pings: L.GeoJSON,
  drawSelectedLayer: () => void
): void => {
  mapRef.current = L.map('map', { zoomControl: false }).setView([55, -128], 6);
  const layerPicker = L.control.layers();
  addTileLayers(mapRef, layerPicker);

  layerPicker.addOverlay(tracks, 'Critter Tracks');
  layerPicker.addOverlay(pings, 'Critter Locations');

  mapRef.current.addLayer(drawnItems);
  mapRef.current.addLayer(selectedPings);

  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      marker: false,
      polyline: false,
      circle: false,
      circlemarker: false
    },
    edit: {
      featureGroup: drawnItems
    }
  });

  mapRef.current.addControl(drawControl);
  mapRef.current.addControl(layerPicker);

  // Set up the drawing events
  mapRef.current
    .on('draw:created', (e) => {
      drawnItems.addLayer((e as any).layer);
      drawSelectedLayer();
    })
    .on('draw:edited', (e) => {
      drawSelectedLayer();
    })
    .on('draw:deletestop', (e) => {
      drawSelectedLayer();
    });
};

export { initMap, setupPingOptions, setupSelectedPings, addTileLayers };
