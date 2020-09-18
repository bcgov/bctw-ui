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

makeMarkers = ->
  markers = L.geoJson @$store.getters.pings, do
    pointToLayer: (feature,latlng) ->
      pointStyle = do
        radius: 8
        fillColor: 'yellow'
        color: "#000"
        weight: 1
        opacity: 1
        fillOpacity: 0.9
      L.circleMarker latlng, pointStyle

    onEachFeature: (feature,layer) ->
      layer.bindPopup document.querySelector '#popup .popup'

  storeData = ~> @$store.commit 'pingActive', it.layer.feature.properties

  markers.on 'click',storeData


drawPingLayer = ->
  clusterLayer = L.markerClusterGroup do
    disableClusteringAtZoom: 14

  #// Define the marker layer
  markers = makeMarkers.call @
  clusterLayer.addLayer markers

  chooseToToggleCluster = ~> 
    if @$store.getters.clusterCritters
      map.removeLayer markers
      map.addLayer clusterLayer
    else
      map.addLayer markers
      map.removeLayer clusterLayer

  chooseToToggleCluster!

  @$root.$on 'refreshCritterLayers', ~>
    clusterLayer.clearLayers!
    markers := makeMarkers.call @
    clusterLayer.addLayers markers
    chooseToToggleCluster!

  @$root.$on 'toggleClusterCritters', chooseToToggleCluster


draw = ->
  map := L.map 'map', zoomControl: no
    .setView [55,-128], 6

  L.control.zoom position: 'bottomright'
    .addTo map

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">ESRI Basemap</a> ',
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


  #//map.addControl drawControl #These don't do anything yet.

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