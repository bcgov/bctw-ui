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

        vs-sidebar-item(index='4' icon='exit_to_app' class='page-logout')
          a(href='/logout') Logout

        vs-divider(position='center') Filters

        vs-select(
          label='Time Window'
          class='select-time--window'
          v-model="select"
          @change="selectChanged(select)"
        )
          vs-select-item(
            :key='index'
            :value='item.value'
            :text='item.text'
            v-for='item,index in times'
          )
        vs-button(
          class='download'
          color='primary'
          type='line'
          size='small'
          icon="cloud_download"
          @click="downloadData"
          ) Download




    #page
      transition(name='fade', mode='out-in')
        keep-alive
          router-view
</template>

<script lang="ls">
#//view3D = (mutation) ->
#//  @$router
#//    .push query: 'terrain-centroid': mutation.payload.id
#//    .catch  -> if it then console.error it

connect = -> 
  this.$store.subscribe (mutation) ~>
    #//switch mutation.type
    #//| 'terrainCentroidActive' => view3D.call @,mutation

selectChanged = ->
  #// Signal map to refresh collar layer
  callback =  ~> @$root.$emit 'redrawClusterLayer'

  @$store.commit 'timeWindow', it
  @$store.commit 'requestPings', callback

downloadData = ->
  pings = @$store.getters.pings
  console.log pings

``
export default {
  mounted: connect,
  methods: {
    selectChanged,
    downloadData
  },
  data:()=>({
    active: true,
    select: '1 days',
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

    .header-sidebar h4
      margin-top 0.5rem
      margin-bottom 0.2rem
      


</style>