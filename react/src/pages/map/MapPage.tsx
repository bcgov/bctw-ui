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

  };

  useEffect(() => {
    initMap();
  });

  return (
    <div id='map'></div>
  )
}

export default MapPage;