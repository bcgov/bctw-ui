<template lang="pug">
.popup
  div Device ID: {{$store.getters.pingActive.CollarID || $store.getters.pingActive['Device ID']}}
  div Date: {{$store.getters.pingActive.UTC_Date || $store.getters.pingActive['Date & Time [GMT]']}}

  //- vs-button(
  //-   class='btn-3d'
  //-   type='line'
  //-   @click='view3D()'
  //- ) View in 3D

</template>

<script lang='ls'>
``import request from 'request'``

/* ## view3D
  Go to the terrain screen with the terrain-centroid 
  ID as a parameter.
 */
view3D = ->
  id = @$store.getters.pingActive.id

  #// Change to terrain view with the correct hash
  @$router.push name: 'terrain', query: 'terrain-centroid': id

  #// Send a signal if the map is already initialized
  @$root.$emit 'redraw-terrain', id


``
export default {
  name: 'pingPopup',
  methods: {
    view3D
  }
}
``

</script>

<style lang="stylus">
.road-name
  font-size 20px

.assets
  font-size 18px

.asset-attributes
  font-size 14px

.leaflet-popup
  min-width 250px

  .leaflet-popup-content-wrapper
    padding-bottom 2rem

.btn-3d
  float right



</style>