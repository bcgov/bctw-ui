import * as L from 'leaflet';
import { FeatureLayer } from 'esri-leaflet';
import LabeledMarker from 'leaflet-labeled-circle';
import React, { MutableRefObject } from 'react';
import dayjs from 'dayjs';
import length from '@turf/length';
import { ITelemetryPoint, TelemetryDetail } from 'types/map';
import { MAP_COLOURS } from 'pages/map/map_helpers';
import { MapStrings } from 'constants/strings';
import { MapTileLayers } from 'constants/strings';
import { formatLocal } from 'utils/time';
import { plainToClass } from 'class-transformer';
import { Point } from 'geojson';
import { eCritterStatus } from 'types/animal';
const hidePopup = (): void => {
  const doc = document.getElementById('popup');
  doc.innerHTML = '';
  doc.classList.remove('appear-above-map');
};

const setPopupInnerHTML = (feature: ITelemetryPoint): void => {
  const doc = document.getElementById('popup');
  const p = feature.properties;
  const { coordinates } = feature.geometry;
  const t = dayjs(p.date_recorded).format(formatLocal);
  const text = `
    ${p.taxon ? 'Taxon: ' + p.taxon + '<br>' : ''}
    ${p.wlh_id ? 'WLH ID: ' + p.wlh_id + '<br>' : ''}
    ${p.animal_id ? 'Critter ID: ' + p.animal_id + '<br>' : ''}
    Device ID: ${p.formattedDevice}<br>
    Latitude: ${coordinates[1] + '<br>'}
    Longitude: ${coordinates[0] + '<br>'}
    Elevation: ${p.elevation + ' meters' + '<br>'}
    Frequency (MHz): ${p.paddedFrequency}<br>
    ${p.critter_status ? 'Critter Status: ' + '<b>' + p.critter_status + '</b><br>' : ''}
    ${p.critter_status === eCritterStatus.mortality ? 'Mortality Date: ' + p.mortality_date + '<br>' : ''}
    ${p.sex ? 'Sex: ' + p.sex + '<br>' : ''}
    ${p.device_status ? 'Device Status: ' + '<b>' + p.device_status + '</b><br>' : ''}
    Time: ${dayjs(t).format('MMMM D, YYYY h:mm A')} UTC<br>
    ${p.collective_unit ? 'Location: ' + '<b>' + p.collective_unit + '</b><br' : ''}
  `;
  doc.innerHTML = text;
  doc.classList.add('appear-above-map');
};

// caribou herd boundaries
const getCHB = (): L.TileLayer => {
  const fl = new FeatureLayer({
    url: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Caribou_BC/FeatureServer/0'
  });
  return fl as unknown as L.TileLayer;
};

// URL for BC Geographic Warehouse
const bcgw_url = 'http://openmaps.gov.bc.ca/geo/pub/ows';

// ENV regional boundaries
const getERB = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// parks and protected areas
const getPPA = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// wildlife habitat areas
const getWHA = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// wildlife magement units
const getWMU = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// TRIM contour lines
const getTCL = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_BASEMAPPING.TRIM_CONTOUR_LINES',
    format: 'image/png',
    transparent: true,
    opacity: 0.6
  });
};

// ungulate winter ranges
const getUWR = (): L.TileLayer.WMS => {
  return L.tileLayer.wms(bcgw_url, {
    layers: 'WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP',
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
  const esriWorldTopo = L.tileLayer(MapTileLayers.esriWorldTopo, {
    maxZoom: 24
  });
  layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
  layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');
  layerPicker.addBaseLayer(esriWorldTopo, 'ESRI World Topo');

  // overlays from BCGW
  layerPicker.addOverlay(getCHB(), 'Caribou Herd Boundaries');
  layerPicker.addOverlay(getERB(), 'ENV Regional Boundaries');
  layerPicker.addOverlay(getPPA(), 'Parks & Protected Areas');
  //layerPicker.addOverlay(getTCL(), 'TRIM Contour Lines');
  layerPicker.addOverlay(getWHA(), 'Wildlife Habitat Areas');
  layerPicker.addOverlay(getWMU(), 'Wildlife Management Units');
  layerPicker.addOverlay(getUWR(), 'Ungulate Winter Range');
};

const initMap = (
  mapRef: MutableRefObject<L.Map>,
  drawnItems: L.FeatureGroup,
  selectedPings: L.GeoJSON,
  drawSelectedLayer: () => void,
  handleDrawLine: (l) => void,
  handleDeleteLine: () => void,
  handleDeleteLayer?: (layers: L.LayerGroup) => void,
  drawToolOptions?: L.Control.DrawOptions,
  drawToolDisable?: boolean,
  divID?: string
): void => {
  const DIV_ID = divID ?? 'map';
  const container = L.DomUtil.get(DIV_ID);
  if (container) {
    container['_leaflet_id'] = null;
  }
  mapRef.current = L.map(DIV_ID, { zoomControl: true }).setView([55, -128], 6);
  console.log('initMap: ' + DIV_ID);
  const layerPicker = L.control.layers(null, null, { position: 'topleft' });
  L.drawLocal.draw.toolbar.buttons.polyline = MapStrings.drawLineLabel;
  L.drawLocal.draw.toolbar.buttons.polygon = MapStrings.drawPolygonLabel;
  L.drawLocal.draw.toolbar.buttons.rectangle = MapStrings.drawRectangleLabel;
  addTileLayers(mapRef, layerPicker);

  mapRef.current.addLayer(drawnItems);
  mapRef.current.addLayer(selectedPings);

  const drawOptions = drawToolOptions ?? { marker: false, circle: false, circlemarker: false };

  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: drawOptions,
    edit: {
      featureGroup: drawnItems
    }
  });

  if (!drawToolDisable) {
    mapRef.current.addControl(drawControl);
  }

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
    .on('draw:deleted', (data: any) => {
      //Leaflet Draw does not appear to have proper typing for this event type. Annoying!
      handleDeleteLayer?.(data.layers);
    })
    .on('draw:edited', (e) => {
      drawSelectedLayer();
    })
    .on('draw:deletestop', (e) => {
      drawSelectedLayer();
      handleDeleteLine();
    });
};

export { initMap, hidePopup, setPopupInnerHTML, addTileLayers };
