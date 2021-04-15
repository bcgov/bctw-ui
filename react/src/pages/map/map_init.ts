import * as L from 'leaflet';
import length from '@turf/length';
import LabeledMarker from 'leaflet-labeled-circle';
import dayjs from 'dayjs';
import { formatLocal } from 'utils/time';
import { getFillColorByStatus } from 'pages/map/map_helpers';
import React, { MutableRefObject } from 'react';
import { MapTileLayers } from 'constants/strings';
import { TelemetryFeature } from 'types/map';

const defaultPointStyle: L.CircleMarkerOptions = {
  // fillColor added later
  radius: 8,
  color: '#000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.9
};


const setupPingOptions = (
  pings: L.GeoJSON,
  onClickPointHandler: L.LeafletEventHandlerFn,
  colours: Record<string, string>
): void => {

  const LatestPingIcon = L.icon({
    iconUrl: '',
    iconSize: [5, 5],
    // iconAnchor: [22, 94],
    // popupAnchor: [-3, -76],
    // shadowUrl: './star.png',
    // shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
  });

  pings.options = {
    pointToLayer: (feature, latlng: L.LatLngExpression ): L.Layer => {
      const colour = getFillColorByStatus(feature as any, colours);
      const pointStyle = { fillColor: colour, ...defaultPointStyle };
      const marker = L.circleMarker(latlng, pointStyle);
      // const marker = new L.Marker(latlng, {icon: LatestPingIcon});
      // add the event listener
      marker.on('click', onClickPointHandler);
      return marker;

    },
    onEachFeature: (feature, layer): void => {
      layer.addEventListener('popupopen', onClickPointHandler);
    }
  };
};

const hidePopup = (): void => {
  const doc = document.getElementById('popup');
  doc.innerHTML = '';
  doc.classList.remove('appear-above-map');
};

const setPopupInnerHTML = (feature: TelemetryFeature): void => {
  const doc = document.getElementById('popup');
  const p = feature.properties;
  const g = feature.geometry;
  const x = `${g.coordinates[0]?.toFixed(5)}\xb0`;
  const y = `${g.coordinates[1]?.toFixed(5)}\xb0`;
  const t = dayjs(p.date_recorded).format(formatLocal);
  const text = `
    ${p.species ? 'Species: ' + p.species : ''} ${p.animal_id ? 'ID: ' + p.animal_id + '<br>' : ''} 
    ${p.wlh_id ? 'WLHID: ' + p.wlh_id + '<br>' : ''}
    Device ID: ${p.device_id} (${p.device_vendor}) <br>
    ${p.frequency ? 'Frequency: ' + p.frequency + '<br>' : ''}
    ${p.animal_status ? 'Animal Status: ' + '<b>' + p.animal_status + '</b><br>' : ''}
    ${p.device_status ? 'Collar Status: ' + '<b>' + p.device_status + '</b><br>' : ''}
    ${p.population_unit ? 'Population Unit: ' + p.population_unit + '<br>' : ''}
    ${t} <br>
    Location: ${x}, ${y}
  `;
  doc.innerHTML = text;
  doc.classList.add('appear-above-map');
};

const setupSelectedPings = (colors: Record<string, string>): L.GeoJSONOptions => {
  return {
    pointToLayer: (feature, latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        fillColor: colors['selected point'],
        ...defaultPointStyle
      };
      return L.circleMarker(latlng, pointStyle);
    }
  };
};

// The BCGW URL
const bcgw = 'http://openmaps.gov.bc.ca/geo/pub/ows';

// Ungulate Winter Ranges
const getUWR = () => {
  return L.tileLayer.wms(bcgw, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// Cariboo Herd Locations
const getCHL = () => {
  return L.tileLayer.wms(bcgw, {
    layers: 'WHSE_WILDLIFE_INVENTORY.GCPB_CARIBOU_POPULATION_SP',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

const addTileLayers = (mapRef: React.MutableRefObject<L.Map>, layerPicker: L.Control.Layers): void => {
  const bingOrtho = L.tileLayer(MapTileLayers.bing, {
    attribution: '&copy; <a href="https://esri.com">ESRI Basemap</a> ',
    maxZoom: 24,
    maxNativeZoom: 17
  }).addTo(mapRef.current);

  const bcGovBaseLayer = L.tileLayer(MapTileLayers.govBase, {
    maxZoom: 24,
    attribution: '&copy; <a href="https://www2.gov.bc.ca/gov/content/home">BC Government</a> '
  });
  layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
  layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');

  // Some BCGW Overlays
  layerPicker.addOverlay(getUWR(), 'Ungulate Winter Ranges');
  layerPicker.addOverlay(getCHL(), 'Cariboo Herd Locations');
};

// const initMap = (): void => {
const initMap = (
  mapRef: MutableRefObject<L.Map>,
  colours: Record<string, string>,
  drawnItems: L.FeatureGroup,
  selectedPings: L.GeoJSON,
  tracks: L.GeoJSON,
  pings: L.GeoJSON,
  drawSelectedLayer: () => void,
  handleMapClick: () => void
): void => {
  mapRef.current = L.map('map', { zoomControl: true }).setView([55, -128], 6);
  const layerPicker = L.control.layers();
  addTileLayers(mapRef, layerPicker);

  layerPicker.addOverlay(tracks, 'Animal Tracks');
  layerPicker.addOverlay(pings, 'Animal Locations');

  mapRef.current.addLayer(drawnItems);
  mapRef.current.addLayer(selectedPings);

  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      marker: false,
      circle: false,
      circlemarker: false
    },
    edit: {
      featureGroup: drawnItems
    }
  });

  mapRef.current.addControl(drawControl);
  mapRef.current.addControl(layerPicker);

  const drawLabel = (e) => {
    // Get the feature
    const lineString = e.layer.toGeoJSON();
    const distance = Math.round(length(lineString) * 10) / 10; // kms
    const geos = e.layer.editing.latlngs;
    const { lat, lng } = geos[0][geos[0].length - 1];
    const feature = {
      type: 'Feature',
      properties: {
        text: `${distance}`,
        labelPosition: [lng, lat]
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    };

    new LabeledMarker(feature.geometry.coordinates.slice().reverse(), feature, {
      markerOpions: {
        color: colours['default track'],
        textStyle: {
          color: colours['outline'],
          fontSize: 3
        }
      }
    }).addTo(mapRef.current);
  };

  // Set up the drawing events
  mapRef.current
    .on('draw:created', (e) => {
      drawnItems.addLayer((e as any).layer);
      if ((e as any).layerType === 'polyline') return drawLabel(e);
      drawSelectedLayer();
    })
    .on('draw:edited', (e) => {
      drawSelectedLayer();
    })
    .on('draw:deletestop', (e) => {
      drawSelectedLayer();
    })
    .on('preclick', (e) => {
      // this is fired before other handlers are called,
      // so if the user did not click a layer point, it will hide the popup
      handleMapClick();
    });
};

export { initMap, hidePopup, setupPingOptions, setupSelectedPings, setPopupInnerHTML, addTileLayers };
