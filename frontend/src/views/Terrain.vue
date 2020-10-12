<template lang="pug">
.page-terrain
  #map
</template>

<script lang='ls'>
``import request from 'request'``
``import {feature} from 'topojson'``

viewer = null

drawPing = ->

  json = @$store.getters.pingsActive
  geoms = json.features

  terrain = new Cesium.GeoJsonDataSource 'terrain'
    .load json, do
      clampToGround: yes

  viewer.dataSources.removeAll yes #// Clear previous
  viewer.dataSources.add terrain #// Add terrain


fetchPings = ->
  @$vs.notify do
    title: 'Loading...'
    text: "Fetching data file"

  if @$store.getters.hasPings
    drawPing.call @
  else
    @$store.dispatch 'requestPings', drawPing.bind(@)

  #// Vue.$vs.notify do
  #//   title: 'Error'
  #//   text: "Failed to fetch terrain file terrain-#id.json"


connect = ->

  #// Set up a listener to redraw data
  #// @$root.$on 'redraw-terrain', fetchPings

  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzk1ZDk0My02MjJmLTQ4ZDgtYmJkMy1kY2Y0YTI0MTg3N2YiLCJpZCI6ODA1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTEyOTM2Nn0.UoAFRv2ErXndRVOI1lltlyWFzaSpE__lpGxe4kb4GSM'

  extent = Cesium.Rectangle.fromDegrees -130,45,-118,60
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent
  Cesium.Camera.DEFAULT_VIEW_FACTOR = 0

  viewer := new Cesium.Viewer 'map', do
    timeline: no
    geocoder: no
    fullscreenButton: no
    vrButton: no
    homeButton: no
    animation: no
    scene3DOnly: yes
    terrainProvider: Cesium.createWorldTerrain do
      requestWaterMask: yes
      requestVertexNormals: yes

  viewer.camera.setView do
    destination: Cesium.Cartesian3.fromDegrees -125,47,400000
    orientation:
      heading: Cesium.Math.toRadians 0
      pitch: Cesium.Math.toRadians -40
      roll: 0.0

  #//slope = viewer.scene.imageryLayers.addImageryProvider steepAreas

  #//slope.alpha = 0.5

  #// if @$route.query['terrain-centroid'] then fetchPings.call @, that
  fetchPings.call @

  @$root.$on 'refreshCritterLayers', ~> drawPing.call @
  

``
export default {
  name: 'Terrain',
  mounted: connect
}
``

</script>

<style lang="stylus" scoped>
#map
  position absolute 
  width 100%
  height 100%
  margin 0px

  .cesium-widget-credits
    display none !important
</style>
