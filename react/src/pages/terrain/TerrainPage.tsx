import React, {useEffect, useRef} from 'react';
import {Viewer, createWorldTerrain, Cartesian3, Math} from 'cesium';
// import * as Cesium from 'cesium'
// import 'cesium/Build/Cesium/Widgets/widgets.css'

// Because Cesium isn't very React friendly
// @ts-ignore
// window.CESIUM_BASE_URL = 'http://localhost:3000';
// window.CESIUM_BASE_URL = 'http://localhost:3000';

type ITerrainPageProps = { }

const TerrainPage: React.FC<ITerrainPageProps> = (props) => {
  const mapRef = useRef(null);

  const initMap = () => {

    console.log(Viewer);
    // const viewer = new Cesium.Viewer(document.getElementById('terrain'));
    // Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM'
    // const extent = Cesium.Rectangle.fromDegrees(-130,45,-118,60);
    // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    // Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    mapRef.current = new Viewer('terrain', {
      timeline: false,
      geocoder: false,
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

  useEffect(() => {
    initMap();
  });

  return (
    <div id='terrain'></div>
  )
}

export default TerrainPage;