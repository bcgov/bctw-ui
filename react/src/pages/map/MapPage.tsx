import React, {useEffect, useRef} from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

// type IMapPageProps = { }

const MapPage: React.FC = () => {
  const mapRef = useRef<L.Map>(null);

  const initMap = (): void => {
    mapRef.current = L.map('map', {zoomControl:false})
      .setView([55, -128], 10);

    const layerPicker = L.control.layers();

    const bingOrtho = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">ESRI Basemap</a> ',
      maxZoom: 18
    }).addTo(mapRef.current);

    const bcGovBaseLayer = L.tileLayer('https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}', { maxZoom: 24 }).addTo(mapRef.current);

    layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
    layerPicker.addBaseLayer(bcGovBaseLayer, 'Bing Satellite');

    mapRef.current.addControl(layerPicker);

  };


  useEffect(() => {
    initMap();
  });

  return (
    <div id='map'></div>
  )
}

export default MapPage;