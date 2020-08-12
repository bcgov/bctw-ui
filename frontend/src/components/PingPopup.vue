<template lang="pug">
.popup
  div Species: {{$store.getters.pingActive.species}}
  div Animal Status: {{$store.getters.pingActive.animal_status}}
  div(v-if='$store.getters.pingActive.animal_id')
    | Animal_id: {{$store.getters.pingActive.animal_id}}
  div(v-if='$store.getters.pingActive.population_unit')
    | Population Unit: {{$store.getters.pingActive.population_unit}}
  div Device ID: {{$store.getters.pingActive.device_id}}
  div Device Vendor: {{$store.getters.pingActive.device_vendor}}
  div(v-if='$store.getters.pingActive.radio_frequency')
    | Radio Frequency: {{$store.getters.pingActive.radio_frequency}}

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