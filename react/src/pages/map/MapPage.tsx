import React, {useEffect, useRef} from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

type IMapPageProps = { }

const MapPage: React.FC<IMapPageProps> = (props) => {
  const mapRef = useRef(null);

  const initMap = () => {
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