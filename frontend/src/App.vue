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
          h5.name &nbsp;
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

        vs-slider(
          id="temporal"
          ticks
          steps=50
          v-model="value1"
        )

        div.collors
          div.collor
            vs-checkbox(v-model='value2') Collar A
          div.collor
            vs-checkbox(v-model='value3') Collar B
          div.collor
            vs-checkbox(v-model='value4') Collar C
          div.collor
            vs-checkbox(v-model='value5') Collar D

        vs-button(
          class='download'
          color='primary'
          type='filled'
          icon="cloud_download"
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

``
export default {
  mounted: connect,
  data:()=>({
    active: true,
    value1: [10,50],
    value2: true,
    value3: true,
    value4: true,
    value5: true
  })
}
``
</script>

<style lang="stylus">
body
  font-family Avenir, Helvetica, Arial, sans-serif

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

  #sidebar

    .collors
      i
        font-size 16px
      .collor
        margin: 0.5rem 0 0.5rem 0

    .download  
      margin 1rem 0 0 8rem

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

    #temporal
      margin 10%
      min-width 0
      width 80%

</style>