<template lang="pug">
.page-map
  #map
    #popup
      PingPopup
</template>

<script lang='ls'>

``import 'leaflet/dist/leaflet.css'``
``import 'leaflet.markercluster/dist/MarkerCluster.css'``
``import 'leaflet.markercluster/dist/MarkerCluster.Default.css'``
``import 'leaflet-draw/dist/leaflet.draw.css'``

``import 'leaflet/dist/images/marker-icon-2x.png'``
``import 'leaflet/dist/images/marker-icon.png'``
``import 'leaflet/dist/images/marker-shadow.png'``

``import L from 'leaflet'``
``import 'leaflet.markercluster/dist/leaflet.markercluster.js'``
``import 'leaflet-draw/dist/leaflet.draw.js'``

``import PingPopup from '../components/PingPopup.vue'``

map = {}

drawPingLayer = ->
  clusterLayer = L.markerClusterGroup do
    disableClusteringAtZoom: 14

  markers = L.geoJson @$store.getters.pings, do

    pointToLayer: (feature,latlng) ->
      pointStyle = do
        radius: 8
        fillColor: 'green'
        color: "#000"
        weight: 1
        opacity: 1
        fillOpacity: 0.5
      L.circleMarker latlng, pointStyle

    onEachFeature: (feature,layer) ->
      layer.bindPopup document.querySelector '#popup .popup'
  
  storeData = ~> @$store.commit 'pingActive', it.layer.feature.properties

  markers
    .on 'click',storeData

  clusterLayer.addLayer markers
  map.addLayer clusterLayer

draw = ->
  map := L.map 'map', zoomControl: no
    .setView [55,-128], 6
  L.control.zoom position: 'bottomright'
    .addTo map

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
  }).addTo(map);

  if @$store.getters.hasPings #// If terrain data exists
    drawPingLayer.call @ #// Draw terrain layer
  else #// If not.. request data then draw terrain layer
    @$store.commit 'requestPings', drawPingLayer.bind(@)

  drawnItems = new L.FeatureGroup!
  map.addLayer drawnItems
  drawControl = new L.Control.Draw do
    position: 'topright'
    edit:
      featureGroup: drawnItems


  map.addControl drawControl

  map.on 'draw:created', -> map.addLayer it.layer
``
export default {
  name: 'Map',
  mounted: draw,
  components: {
    PingPopup
  }
}
``
</script>

<style lang="stylus" scoped>

#map
  position absolute
  width 100%
  height 100%

</style>