import React, {useEffect, useRef} from 'react';
import * as Cesium from 'cesium'

// Because Cesium isn't very React friendly
// @ts-ignore
window.CESIUM_BASE_URL = '';

type ITerrainPageProps = { }

const TerrainPage: React.FC<ITerrainPageProps> = (props) => {
  const mapRef = useRef<Cesium.Viewer>(null);

  const initMap = () => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM'
    const extent = Cesium.Rectangle.fromDegrees(-130,45,-118,60);
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    mapRef.current = new Cesium.Viewer('terrain', {
      timeline: false,
      geocoder: false,
      fullscreenButton: false,
      vrButton: false,
      homeButton: false,
      animation: false,
      scene3DOnly: true,
      terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true
      })
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