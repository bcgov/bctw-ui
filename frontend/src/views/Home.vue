<template lang='pug'>
.home
  .content
    .header
      h2 British Columbia Telemetry Warehouse
      vs-divider
    .description
      p Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      p Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
    .map-link
      router-link(to='/protected/map')
        vs-card.cardx(actionable)
          div(slot='header')
            h4 Location Map
          div(slot='media')
            img(src='../assets/cluster.png')
          div
            span 2D map with clustered point locations.
    .terrain-link
      router-link(to='/protected/terrain')
        vs-card.cardx(actionable)
          div(slot='header')
            h4 Terrain Viewer
          div(slot='media')
            img(src='../assets/terrain.png')
          div
            span 3D map for viewing point locations within a topographical context.
</template>
  
<script lang='ls'>
#// Livescript doesn't support import or export yet
#// Version 2.0 will apparently. This allows it to pass
#// through to Babel.

'Home view' |> console.log

``
export default {
  name: 'home',
  components: {
  }
};
``
</script>

<style lang="stylus">
.content
  font-family OpenSans, arial
  grid-gap 1rem
  display grid
  justify-items center

  p
    margin-bottom 1rem

.header
  grid-column 1 / 3
  grid-row 1

.description
  grid-row 2 / 4
  text-align left

  .list
    margin-left 1rem
    margin-right 2rem

.map-link
  max-width 25rem
  grid-column 2
  grid-row 2
  
  a 
    color black

.terrain-link
  max-width 25rem
  grid-column 2
  grid-row 3

  a 
    color black

.home 
  padding 20px 20px 20px 300px

</style>