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
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ITelemetryDetail, ITelemetryFeature, MapRange } from 'types/map';
import dayjs from 'dayjs';
import { formatDay, getToday } from 'utils/time';


const TerrainPage: React.FC = () => {
  const mapRef = useRef(null);

  const initMap = (): void => {

    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM';

    mapRef.current = new Viewer('terrain', {
      timeline: true,
      geocoder: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      vrButton: false,
      homeButton: false,
      animation: true,
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

    const prod = +(location.port) === 1111 ? false : true;
    const h1 = location.protocol
    const h2 = location.hostname
    const h3 = prod ? location.port : 3000
    const h4 = prod ? '/api' : ''
    const urlTracks = `${h1}//${h2}:${h3}${h4}/get-critter-tracks?start=2020-12-31&end=2021-02-15`;
    const urlPings = `${h1}//${h2}:${h3}${h4}/get-critters?start=2020-12-31&end=2021-02-15`;

    // fetch(urlPings)
    //   .then(res => res.json())
    //   .then(geojson => {
    //     const layer = new GeoJsonDataSource('pings')
    //       .load(geojson,{clampToGround: true});
    //     mapRef.current.dataSources.add(layer);
    //   })
    //   .catch(error=>{console.error('Collar request failed',error)});

    // fetch(urlTracks)
    //   .then(res => res.json())
    //   .then(geojson => {
    //     const layer = new GeoJsonDataSource('pings')
    //       .load(geojson,{clampToGround: true});
    //     mapRef.current.dataSources.add(layer);
    //   })
    //   .catch(error=>{console.error('Track request failed',error)});
  };

  const bctwApi = useTelemetryApi();

  const [range, setRange] = useState<MapRange>({
    start: dayjs().subtract(7, 'day').format(formatDay),
    end: getToday()
  });

  const { start, end } = range;
  const { isFetching: fetchingPings, isError: isErrorPings, data: pingsData } = bctwApi.usePings(start, end);

  const loadSlider = (pingsData) => {
    console.log(pingsData);
  }

  useEffect(() => {
    loadSlider(pingsData);
  }, [pingsData]);

  useEffect(() => {
    initMap();
  });

  return (
    <div id='terrain'></div>
  )
};

export default TerrainPage;