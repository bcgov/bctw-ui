import * as L from 'leaflet';
import length from '@turf/length';
import LabeledMarker from 'leaflet-labeled-circle';
import dayjs from 'dayjs';
import { formatLocal } from 'utils/time';
import { MAP_COLOURS } from 'pages/map/map_helpers';
import React, { MutableRefObject } from 'react';
import { MapTileLayers } from 'constants/strings';
import { ITelemetryPoint, TelemetryDetail } from 'types/map';
import { plainToClass } from 'class-transformer';
import { MapStrings } from 'constants/strings';

const hidePopup = (): void => {
  const doc = document.getElementById('popup');
  doc.innerHTML = '';
  doc.classList.remove('appear-above-map');
};

const setPopupInnerHTML = (feature: ITelemetryPoint): void => {
  const doc = document.getElementById('popup');
  const p = plainToClass(TelemetryDetail, feature.properties);
  const t = dayjs(p.date_recorded).format(formatLocal);
  const text = `
    ${p.species ? 'Species: ' + p.species  + '<br>' : ''}
    ${p.wlh_id ? 'WLH ID: ' + p.wlh_id + '<br>' : ''}
    ${p.animal_id ? 'Animal ID: ' + p.animal_id + '<br>' : ''}
    Device ID: ${p.formattedDevice}<br>
    Frequency (MHz): ${p.paddedFrequency}<br>
    ${p.animal_status ? 'Animal Status: ' + '<b>' + p.animal_status + '</b><br>' : ''}
    ${p.animal_status === 'Mortality' ? 'Mortality Date: ' + p.mortality_date + '<br>' : ''}
    ${p.device_status ? 'Device Status: ' + '<b>' + p.device_status + '</b><br>' : ''}
    Time: ${dayjs(t).format('MMMM D, YYYY h:mm A')} UTC<br>
    Location: ${p.collective_unit}
  `;
  doc.innerHTML = text;
  doc.classList.add('appear-above-map');
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
  layerPicker.addOverlay(getUWR(), 'Ungulate Winter Range');
  layerPicker.addOverlay(getCHL(), 'Cariboo Herd Boundaries');
};

const initMap = (
  mapRef: MutableRefObject<L.Map>,
  drawnItems: L.FeatureGroup,
  selectedPings: L.GeoJSON,
  drawSelectedLayer: () => void,
  handleDrawLine: (l) => void,
  handleDeleteLine: () => void,
): void => {
  mapRef.current = L.map('map', { zoomControl: true }).setView([55, -128], 6);
  const layerPicker = L.control.layers(null ,null,{position: 'topleft'});
  L.drawLocal.draw.toolbar.buttons.polyline = MapStrings.drawLineLabel;
  L.drawLocal.draw.toolbar.buttons.polygon = MapStrings.drawPolygonLabel;
  L.drawLocal.draw.toolbar.buttons.rectangle = MapStrings.drawRectangleLabel;
  addTileLayers(mapRef, layerPicker);

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
    }, 
  });

  mapRef.current.addControl(drawControl);
  mapRef.current.addControl(layerPicker);

  // line drawing control
  const drawLabel = (e): L.Layer => {
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

    const marker = new LabeledMarker(feature.geometry.coordinates.slice().reverse(), feature, {
      markerOpions: {
        color: MAP_COLOURS['track'],
        textStyle: {
          color: MAP_COLOURS['outline'],
          fontSize: 3
        }
      }
    });
    marker.addTo(mapRef.current);
    return marker;
  };

  // Set up the drawing events
  mapRef.current
    .on('draw:created', (e) => {
      drawnItems.addLayer((e as any).layer);
      if ((e as any).layerType === 'polyline') {
        const line = drawLabel(e);
        handleDrawLine(line);
        return line;
      }
      drawSelectedLayer();
    })
    .on('draw:edited', (e) => {
      drawSelectedLayer();
    })
    .on('draw:deletestop', (e) => {
      drawSelectedLayer();
      handleDeleteLine();
    })
};

export { initMap, hidePopup, setPopupInnerHTML, addTileLayers };
