<template lang="pug">
#app
  .parentx-static
    #sidebar
      vs-sidebar.sidebar-primaryx(
        color="primary"
        v-model="active"
        hidden-background=true
      )
        .header-sidebar(slot="header")
          h4.name BCTW
          h5.name Caribou Recovery Program

        vs-sidebar-item(index='1' icon='home' class='page-home')
          router-link(to='/') Home

        vs-sidebar-item(index='2' icon='grain' class='page-map')
          router-link(to='/protected/map') Location Map

        vs-sidebar-item(index='3' icon='terrain' class='page-terrain')
          router-link(to='/protected/terrain') Terrain Viewer

        vs-sidebar-item(index='4' icon='dashboard' class='')
          router-link(to='/protected/data') Data Management

        vs-sidebar-item(index='5' icon='exit_to_app' class='page-logout')
          a(href='/logout') Logout

        vs-divider(position='center') Controls

        vs-checkbox(
          class='cluster-critters'
          v-model='clusterCritters'
          @change="toggleClusterCritters(clusterCritters)"
        ) Cluster critters
        

        vs-divider(position='center') Temporal Filters

        vs-checkbox(
          class='latest-pings'
          v-model='latestPings'
          @change="toggleLatestCritters(latestPings)"
        ) most recent locations

        vs-button(
          class='download'
          color='primary'
          type='line'
          size='small'
          icon="cloud_download"
          @click="downloadData"
          ) Download

        TemporalSlider

        vs-divider(position='center') On Display

        div#critter-list.vs-con-loading__container

          h3 Population Units

          vs-checkbox(
            class='check-filter'
            v-model='item.on'
            v-for='item,index in $store.getters.herdsActive'
            @change="$store.commit('filterPings',item)"
          ) {{item.name}}


          h3.more-header Species

          vs-checkbox(
            class='check-filter'
            v-model='item.on'
            v-for='item,index in $store.getters.speciesActive'
            @change="$store.commit('filterPings',item)"
          ) {{item.name}}


    #page
      transition(name='fade', mode='out-in')
        keep-alive
          router-view
</template>

<script lang="ls">
``
import download from 'downloadjs'
import TemporalSlider from './components/TemporalSlider.vue'
import {bus} from './main'
``

#//view3D = (mutation) ->
#//  @$router
#//    .push query: 'terrain-centroid': mutation.payload.id
#//    .catch  -> if it then console.error it

/* ## pingsHaveChanged
  There has been a change in the pings array through a fresh 
  request to the API. Calculate the groups to display for online filtering
  @param state {object} The Vuex state object
 */
pingsHaveChanged = (state) ->

  herds = state.pings.features.reduce (pV,cV,cI) ->
    herd = cV.properties.population_unit || 'Other'

    #// Check if this item is already there
    duplicate = pV.some -> it.name === herd

    #// If not there yet
    unless duplicate then pV.push do
      name: herd
      on: yes

    pV
  ,[]

  #// Sort
  herds.sort (a,b) -> if a.name < b.name then -1 else 1
  

  species = state.pings.features.reduce (pV,cV,cI) ->
    sp = cV.properties.species || 'Other'

    #// Check if this item is already there
    duplicate = pV.some -> it.name === sp

    #// If not there yet
    unless duplicate then pV.push do
      name: sp
      on: yes

    pV
  ,[]

  #// Sort
  species.sort (a,b) -> if a.name < b.name then -1 else 1

  @$store.commit 'herdsActive', herds
  @$store.commit 'speciesActive', species


connect = -> 
  this.$store.subscribe (mutation,state) ~>
    switch mutation.type
    | 'writePings'  => pingsHaveChanged.call @,state
    | 'filterPings' => this.$root.$emit 'refreshCritterLayers'
  #//| 'terrainCentroidActive' => view3D.call @,mutation

  @$vs.loading do
    container: '#critter-list'
    type: 'sound'

  callback = ~>
    @$vs.loading.close '#critter-list > .con-vs-loading'
    bus.$emit 'refreshCritterLayers' #// Signal map to refresh collar layer

  #// Request
  @$store.dispatch 'requestPingExtent', ~>
    @$store.dispatch 'requestPings', callback



toggleLatestCritters = (checked) ->

  @$vs.loading do
    container: '#critter-list'
    type: 'sound'

  callback = ~>
    @$vs.loading.close '#critter-list > .con-vs-loading'
    @$root.$emit 'refreshCritterLayers' #// Signal map to refresh collar layer

  if checked
    @$store.dispatch 'requestMostRecentPings', callback
  else
    @$store.dispatch 'requestPings', callback


downloadData = ->
  pings = JSON.stringify @$store.getters.pingsActive
  download pings, 'collars.geojson', 'application/json'


toggleClusterCritters = (checked) ->
  @$store.commit 'toggleClusterCritters', checked
  @$root.$emit 'toggleClusterCritters'


``
export default {
  mounted: connect,
  methods: {
    toggleLatestCritters,
    downloadData,
    toggleClusterCritters
  },
  components: {
    TemporalSlider
  },
  data:()=>({
    active: true,
    select: '1 days',
    latestPings: false,
    clusterCritters: true,
    times: [
      {text: '1 day', value: '1 days'},
      {text: '1 week', value: '1 weeks'},
      {text: '1 month', value: '1 months'},
      {text: '3 months', value: '3 months'},
      {text: '6 months', value: '6 months'},
    ]
  })
}
``
</script>

<style lang="stylus">
body
  font-family Avenir, Helvetica, Arial, sans-serif

  .vs-select--options
    z-index 100000 !important

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

  #sidebar
    .temporal-slider
      margin-top 2rem
      margin-bottom 2rem

    #critter-list
      text-align left

      h3
        margin 0 0 0.5rem .5rem

      h3.more-header
        margin 1rem 0 0.5rem .5rem

      .check-filter
        justify-content left
        margin 0.5rem 0 0.5rem 1rem


    .con-vs-checkbox i 
      font-size 18px

    .latest-pings,.cluster-critters
      justify-content left
      margin 1rem

      .con-slot-label
        font-size 15px !important

    button.download i
      top 0.4rem

    .select-time--window
      display inline-block
      width 8rem

      label
        position relative
        left -1.5rem

    .download  
      display inline-block
      margin-left 0.5rem
      float none

    .collors
      i
        font-size 16px
      .collor
        margin: 0.5rem 0 0.5rem 0

    header 
      text-align left
      background #036
      color white
      background-image url("../www/bcgov-header-vert-MD.png")
      background-repeat no-repeat
      height 4.1rem

      div
        margin-top 0
        margin-left 4rem

    .vs-sidebar--items
      border-top-style solid
      border-color orange
      border-width 4px

    .vs-list--title
      font-size 14px
      font-weight 400

    .vs-list--item
      padding 0 5px 0 5px
    .vs-list--header 
      padding 5px 0 0 0

    .header-sidebar h4
      margin-top 0.5rem
      margin-bottom 0.2rem

      
</style>