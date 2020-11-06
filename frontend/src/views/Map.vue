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

``import {bus} from '../main'``

map = {}

makeMarkers = ->
  markers = L.geoJson @$store.getters.pingsActive, do
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
    iconCreateFunction: (cluster) ->
      count = cluster.getChildCount!
      points = cluster.getAllChildMarkers!

      mortality = no
      for point in points
        p = point.feature.properties
        if p.animal_status == 'Mortality' then mortality = yes

      cl = if mortality
        'marker-cluster marker-cluster-large'
      else
        'marker-cluster marker-cluster-small'

      new L.DivIcon do
        html: "<div><span>#count</span></div>"
        className: cl
        iconSize: new L.Point 40,40

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

  #// XXX: This is firing on first draw AND when the slider is adjusted
  #//      However it's not refreshing the layer on slider completion
  refreshCritters = ~>
    console.log 'refreshCritters'
    clusterLayer.clearLayers!
    map.removeLayer markers
    markers := makeMarkers.call @ #// Parent function wide 
    clusterLayer.addLayers markers
    chooseToToggleCluster!

  /*
    Refresh all critter layers.
   */

  bus.$on 'refreshCritterLayers', refreshCritters
  
  /*
    Toggle the critter clustering
   */
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

  drawPingLayer.call @ #// Draw terrain layer

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