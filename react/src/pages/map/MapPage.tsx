import React, {useEffect, useRef, useState} from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '@turf/points-within-polygon';
import './MapPage.css';
import moment from 'moment';
import pointsWithinPolygon from '@turf/points-within-polygon';

const MapPage: React.FC = () => {
  const mapRef = useRef<L.Map>(null);

  const [tracks,setTracks] = useState(new L.GeoJSON()); // Store Tracks

  const [pings,setPings] = useState(new L.GeoJSON()); // Store Pings

  const drawnItems = new L.FeatureGroup(); // Store the selection shapes

  pings.options = {pointToLayer: (feature,latlng) => {
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
      const g = (feature.geometry as any); // Yes... this exists!
      const x = g.coordinates[0]?.toFixed(5);
      const y = g.coordinates[1]?.toFixed(5);
      const text = `
        ${p.species || ''} ${p.animal_id || 'No WLHID'} <br>
        <hr>
        Device ID ${p.device_id} (${p.device_vendor}) <br>
        ${p.radio_frequency ? 'Frequency of ' + p.radio_frequency + '<br>' : ''}
        ${p.population_unit ? 'Unit ' + p.population_unit + '<br>' : ''}
        ${moment(p.date_recorded).format("dddd, MMMM Do YYYY, h:mm:ss a")} <br>
        ${x}, ${y}
      `
      layer.bindPopup(text);
    }
  };

  const selectedPings = new L.GeoJSON(); // Store the selected pings

  (selectedPings as any).options = { pointToLayer: (feature,latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        radius: 10,
        fillColor: '#ffff00',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      };
      return L.circleMarker(latlng,pointStyle);
    }
  };  

  const drawSelectedLayer = () => {
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    // More typescript type definition bugs... These are the right features!!!
    const overlay = pointsWithinPolygon((allPings as any),(clipper as any));

    // Clear any previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        mapRef.current.removeLayer(layer);
      }
    })

    selectedPings.addData(overlay);

  };


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
    layerPicker.addOverlay(pings,'Critter Locations')

    mapRef.current.addControl(layerPicker);

    mapRef.current.addLayer(drawnItems);

    mapRef.current.addLayer(selectedPings);

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

    // Configure ping layer

    // Fetch the ping data
    fetch(urlPings)
      .then(res => res.json())
      .then(geojson => {pings.addData(geojson)})
      .catch(error=>{console.error('collar request failed',error)});

    // Set up the drawing events
    mapRef.current.on('draw:created', (e) => {
      drawnItems.addLayer((e as any).layer);
      drawSelectedLayer();
    }).on('draw:edited', (e) => {
      drawSelectedLayer();
    }).on('draw:deletestop', (e) => {
      drawSelectedLayer();
    });
  };



  // When the dom is ready... Add map.
  useEffect(() => {
    initMap();
  });

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  },[tracks]);

  // Add the ping layer
  useEffect(() => {
    pings.addTo(mapRef.current);
  },[pings]);

  const handleKeyPress = (e) => {
    console.log(e);
  };

  return (
    <div id='map' onKeyUp={handleKeyPress}></div>
  )
}

export default MapPage;