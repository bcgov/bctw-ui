<template lang='pug'>
  .home
    .content
      .header
        dataTabs
</template>
  
<script lang='ls'>
``import DataTabs from '../components/data/DataTabs'``

``
export default {
  name: 'home',
  components: {
    DataTabs
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

.header
  grid-column 1 / 3
  grid-row 1

.home 
  padding 20px 20px 20px 300px
</style>