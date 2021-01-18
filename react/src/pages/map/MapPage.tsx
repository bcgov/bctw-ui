import React, {useEffect, useRef, useState} from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapPage.css';

// type IMapPageProps = { }

const MapPage: React.FC = () => {
  const mapRef = useRef<L.Map>(null);

  const [tracks,setTracks] = useState(new L.GeoJSON());

  const [pings,setPings] = useState(new L.GeoJSON());

  const initMap = (): void => {
    mapRef.current = L.map('map', {zoomControl:false})
      .setView([55, -128], 6);

    const layerPicker = L.control.layers();

    const bingOrtho = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://esri.com">ESRI Basemap</a> ',
      maxZoom: 24,
      maxNativeZoom: 17
    }).addTo(mapRef.current);

    const bcGovBaseLayer = L.tileLayer('https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 24,
      attribution: '&copy; <a href="https://www2.gov.bc.ca/gov/content/home">BC Government</a> ',
    });

    layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
    layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');

    layerPicker.addOverlay(tracks,'Critter Tracks')

    mapRef.current.addControl(layerPicker);

    const drawnItems = new L.FeatureGroup();
    mapRef.current.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw:{
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    mapRef.current.addControl(drawControl);


    const prod = +(location.port) === 1111 ? false : true;
    const h1 = location.protocol
    const h2 = location.hostname
    const h3 = prod ? location.port : 3000
    const h4 = prod ? '/api' : ''
    const urlTracks = `${h1}//${h2}:${h3}${h4}/get-critter-tracks?start=2020-12-21&end=2020-12-31`;
    const urlPings = `${h1}//${h2}:${h3}${h4}/get-critters?start=2020-12-21&end=2020-12-31`;

    // Fetch the tracks data
    fetch(urlTracks)
      .then(res => res.json())
      .then(geojson => tracks.addData(geojson))
      .catch(error=>{console.error('collar request failed',error)});

    // Fetch the ping data
    // TODO: Clean this up.
    fetch(urlPings)
      .then(res => res.json())
      .then(geojson => {
        const options = {pointToLayer: (feature,latlng) => {

          // Mortality is red
          const s = feature.properties.animal_status;
          const colour = (s === 'Mortality') ? '#ff0000' : '#00ff44';

          const pointStyle = {
            radius: 8,
            fillColor: colour,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
          }

          return L.circleMarker(latlng, pointStyle);
        },
        onEachFeature: (feature,layer) => {
          const p = feature.properties;
          const text = `
            Animal ID: ${p.animal_id} <br>
            Species: ${p.species} <br>
            Population Unit: ${p.population_unit} <br>
            GPS Vendor: ${p.device_vendor} <br>
            Date Recorded: ${p.date_recorded}
          `
          layer.bindPopup(text);
        }
      };
        const layer = L.geoJSON(geojson,options);
        layerPicker.addOverlay(layer,'Critter Locations')
        layer.addTo(mapRef.current)
      })
      .catch(error=>{console.error('collar request failed',error)});

  };


  // When the dom is ready... Add map.
  useEffect(() => {
    initMap();
  });

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  },[tracks]);

  return (
    <div id='map'></div>
  )
}

export default MapPage;