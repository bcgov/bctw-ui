// note: deprecated
export {

}
// import React, {useEffect, useRef, useState} from 'react';
// import {
//   Viewer,
//   createWorldTerrain,
//   Cartesian3,
//   Math,
//   Ion,
//   GeoJsonDataSource,
//   CzmlDataSource} from 'cesium';
// import './TerrainPage.scss';
// import { useTelemetryApi } from 'hooks/useTelemetryApi';
// import { MapRange } from 'types/map';
// import dayjs from 'dayjs';
// import { formatDay, getToday } from 'utils/time';
// import { convert } from 'geojson2czml';

// const TerrainPage: React.FC = () => {
//   const mapRef = useRef(null);

//   const initMap = (): void => {

//     Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM';

//     mapRef.current = new Viewer('terrain', {
//       timeline: true,
//       geocoder: false,
//       baseLayerPicker: true,
//       fullscreenButton: true,
//       vrButton: false,
//       homeButton: false,
//       animation: true,
//       scene3DOnly: true,
//       terrainProvider: createWorldTerrain({
//         requestWaterMask: true,
//         requestVertexNormals: true
//       })
//     });

//     mapRef.current.camera.setView({
//       destination: Cartesian3.fromDegrees(-125,47,400000),
//       orientation: {
//         heading: Math.toRadians(0),
//         pitch: Math.toRadians(-40),
//         roll: 0.0
//       }
//     });
//   };

//   const bctwApi = useTelemetryApi();

//   const [range, setRange] = useState<MapRange>({
//     start: dayjs().subtract(7, 'day').format(formatDay),
//     end: getToday()
//   });

//   const { start, end } = range;
//   const {
//     isFetching: fetchingPings,
//     isError: isErrorPings,
//     data: pingsData
//   } = bctwApi.usePings(start, end);

//   const {
//     isFetching: fetchingTracks,
//     isError: isErrorTracks,
//     data: tracksData
//   } = bctwApi.useTracks(start, end);

//   const  loadTracks = (tracksData) => {
//     // If the webhook fires even though dependencies are empty
//     if (!tracksData) return;
//     if (!mapRef.current) return;

//     // Wrap in a feature collection
//     const collection = {
//       type: 'FeatureCollection',
//       features: [...tracksData]
//     };

//     // Add layer
//     const layer = new GeoJsonDataSource('pings')
//       .load(collection,{
//         clampToGround: true
//       });
//     mapRef.current.dataSources.add(layer);
//   };

//   /**
//    * ## loadSlider 
//    * Load the Cesium temporal slider with location data.
//    * @param pingsData {object} The critter GeoJSON locations object.
//    */
//   const loadSlider = (pingsData) => {
//     let critters = [];

//     // If the webhook fires even though dependencies are empty
//     if (!pingsData) return;
//     if (!mapRef.current) return;

//     // Convert the geojson into a feature collection
//     const collection = {
//       type: 'FeatureCollection',
//       features: [...pingsData]
//     };
//     // Options for the GeoJSON2CZML conversion
//     const options = {
//       date: 'date_recorded',
//       id: 'critter_id',
//       label: 'wlh_id'
//     };
//     const czml = convert(collection,options); // Convert to CZML
//     const dataSourcePromise = CzmlDataSource.load(czml); // Load CZML

//     /**
//      * Add the Temporal layer to the map
//      * Save all the features to the _entity_ object to be
//      * later referenced in the Post Render Cesium event.
//      */
//     mapRef.current.dataSources
//       .add(dataSourcePromise)
//       .then((ds) => {
//         critters = ds.entities.values.map((f) => {
//           const entity = ds.entities?.getById(f._id);
//           return [
//             entity,
//             entity?.position
//           ]
//         });
//       });


//     // These are needed to find the true elevation of points.
//     const clock = mapRef.current.clock;
//     const scene = mapRef.current.scene;

//     /**
//      * If the points don't contain an accurate elevation
//      * they get projected onto the ellipsoid at an elevation of zero.
//      * As an ellipsiod is not a true representation of the globe's 
//      * surface, quite often the points will land under ground.
//      * Fix that here by looking up the elevation from the terrain 
//      * service and insert into each point.
//      */
//     scene.postRender.addEventListener(() => {
//       critters.forEach((critter) => {
//         const [entity,pos] = critter;
//         const pos2 = pos?.getValue(clock.currentTime);
//         if (!pos2) return;
//         entity.position = scene.clampToHeight(pos2)
//       });
//     });
//   }

//   useEffect(() => {
//     loadSlider(pingsData);
//   }, [pingsData,mapRef.current]);

//   // useEffect(() => {
//   //   loadTracks(tracksData);
//   // }, [tracksData,mapRef.current])

//   useEffect(() => {
//     initMap();
//   });

//   return (
//     <div id='terrain'></div>
//   )
// };

// export default TerrainPage;