import React, {useEffect, useRef, useState} from 'react';
import {
  Viewer,
  createWorldTerrain,
  Cartesian3,
  Math,
  Ion,
  GeoJsonDataSource
} from 'cesium';
import './TerrainPage.css';


const TerrainPage: React.FC = () => {
  const mapRef = useRef(null);

  // const [tracks,setTracks] = useState(new L.GeoJSON());

  const [pings,setPings] = useState(new GeoJsonDataSource('pings'));

  const initMap = (): void => {

    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM';

    mapRef.current = new Viewer('terrain', {
      timeline: true,
      geocoder: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      vrButton: false,
      homeButton: false,
      animation: false,
      scene3DOnly: true,
      terrainProvider: createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true
      })
    });

    mapRef.current.camera.setView({
      destination: Cartesian3.fromDegrees(-125,47,400000),
      orientation: {
        heading: Math.toRadians(0),
        pitch: Math.toRadians(-40),
        roll: 0.0
      }
    });
  };

  const createPingLayer = (pings) => {
    console.log(pings)
  };

  useEffect(() => {
    initMap();
  });

  useEffect(() => {
    createPingLayer(pings);
  },[pings]);

  return (
    <div id='terrain'></div>
  )
};

export default TerrainPage;