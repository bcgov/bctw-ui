import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '@turf/points-within-polygon';
import './MapPage.css';
import moment from 'moment';
import pointsWithinPolygon from '@turf/points-within-polygon';
import tokml from 'tokml';
import download from 'downloadjs';
import { ContactsOutlined } from '@material-ui/icons';
import { Console } from 'console';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

const MapPage: React.FC = () => {
  const bctwApi = useTelemetryApi();

  const mapRef = useRef<L.Map>(null);

  const [tracks, setTracks] = useState(new L.GeoJSON()); // Store Tracks

  const [pings, setPings] = useState(new L.GeoJSON()); // Store Pings

  const drawnItems = new L.FeatureGroup(); // Store the selection shapes

  // const selectedCollars = useRef([]);
  const [selectedCollars, setSelectedCollars] = useState([]);

  // fixme: hardcoded start/end 
  const start = '2021-01-01';
  const end = 'now()';

  const { isError: isErrorTracks, data: tracksData } = (bctwApi.useTracks as any)(start, end);
  const { isError: isErrorPings, data: pingsData } = (bctwApi.usePings as any)(start, end);

  useEffect(() => {
    if (tracksData && !isErrorTracks) {
      tracks.addData(tracksData);
    }
  }, [tracksData]);

  useEffect(() => {
    if (pingsData && !isErrorPings) {
      pings.addData(pingsData);
    }
  }, [pingsData]);

  pings.options = {
    pointToLayer: (feature, latlng) => {
      // Mortality is red
      const s = feature.properties.animal_status;
      const colour = s === 'Mortality' ? '#ff0000' : '#00ff44';

      const pointStyle = {
        radius: 8,
        fillColor: colour,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      };

      return L.circleMarker(latlng, pointStyle);
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const g = feature.geometry as any; // Yes... this exists!
      const x = g.coordinates[0]?.toFixed(5);
      const y = g.coordinates[1]?.toFixed(5);
      const text = `
        ${p.species || ''} ${p.animal_id || 'No WLHID'} <br>
        <hr>
        Device ID ${p.device_id} (${p.device_vendor}) <br>
        ${p.radio_frequency ? 'Frequency of ' + p.radio_frequency + '<br>' : ''}
        ${p.population_unit ? 'Unit ' + p.population_unit + '<br>' : ''}
        ${moment(p.date_recorded).format('dddd, MMMM Do YYYY, h:mm:ss a')} <br>
        ${x}, ${y}
      `;
      layer.bindPopup(text);
    }
  };

  const selectedPings = new L.GeoJSON(); // Store the selected pings

  (selectedPings as any).options = {
    pointToLayer: (feature, latlng) => {
      const pointStyle = {
        class: 'selected-ping',
        radius: 10,
        fillColor: '#ffff00',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      };
      return L.circleMarker(latlng, pointStyle);
    }
  };

  const displaySelectedUnits = (overlay) => {
    const selectedCollars = overlay.features
      .map(f => f.properties.device_id)
      .reduce((total,f) => {
        if (total.indexOf(f) >= 0) {
          return total;
        } else{ 
          return total.concat(f);
        }
      },[]);
    setSelectedCollars(selectedCollars)
    console.log('selection',selectedCollars);
  }

  const drawSelectedLayer = () => {
    const clipper = drawnItems.toGeoJSON();
    const allPings = pings.toGeoJSON();
    // More typescript type definition bugs... These are the right features!!!
    const overlay = pointsWithinPolygon(allPings as any, clipper as any);

    displaySelectedUnits(overlay);

    // Clear any previous selections
    mapRef.current.eachLayer((layer) => {
      if ((layer as any).options.class === 'selected-ping') {
        mapRef.current.removeLayer(layer);
      }
    });

    selectedPings.addData(overlay);
  };

  const initMap = (): void => {
    mapRef.current = L.map('map', { zoomControl: false }).setView([55, -128], 6);

    const layerPicker = L.control.layers();

    const bingOrtho = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://esri.com">ESRI Basemap</a> ',
        maxZoom: 24,
        maxNativeZoom: 17
      }
    ).addTo(mapRef.current);

    const bcGovBaseLayer = L.tileLayer(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        attribution: '&copy; <a href="https://www2.gov.bc.ca/gov/content/home">BC Government</a> '
      }
    );

    layerPicker.addBaseLayer(bingOrtho, 'Bing Satellite');
    layerPicker.addBaseLayer(bcGovBaseLayer, 'BC Government');

    layerPicker.addOverlay(tracks, 'Critter Tracks');
    layerPicker.addOverlay(pings, 'Critter Locations');

    mapRef.current.addLayer(drawnItems);

    mapRef.current.addLayer(selectedPings);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
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

    mapRef.current.addControl(layerPicker);

    // Set up the drawing events
    mapRef.current
      .on('draw:created', (e) => {
        drawnItems.addLayer((e as any).layer);
        drawSelectedLayer();
      })
      .on('draw:edited', (e) => {
        drawSelectedLayer();
      })
      .on('draw:deletestop', (e) => {
        drawSelectedLayer();
      });
  };

  useEffect(() => {
    if (!mapRef.current) {
      initMap();
    }
  });

  // Add the tracks layer
  useEffect(() => {
    tracks.addTo(mapRef.current);
  }, [tracks]);

  // Add the ping layer
  useEffect(() => {
    pings.addTo(mapRef.current);
  }, [pings]);

  const handleKeyPress = (e) => {
    if (!(e.ctrlKey && e.keyCode == 83)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    let kml;
    if ((selectedPings as any).toGeoJSON().features.length > 0) {
      kml = tokml((selectedPings as any).toGeoJSON());
    } else {
      kml = tokml((pings as any).toGeoJSON());
    }
    download(kml, 'collars.kml', 'application/xml');
  };

  return (
    <div>
      <div id='map' onKeyDown={handleKeyPress}></div>
      <div id='collar-list'>
        <ul>
          {selectedCollars.map(collar => (<li key={collar}>{collar}</li>))}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;
