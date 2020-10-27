<style lang="stylus">
.temporal-slider
  margin 1rem
  width 210px

.vue-slider-dot-tooltip-inner
  width 50px !important
  white-space normal !important

</style>


<template lang="pug">

.temporal-slider
  VueSlider(
    v-model="values"
    :min=0
    :max="$store.getters.pingExtent.days"
    :max-range="1000"
    :marks="marks"
    :interval="1"
    :tooltip-formatter="tooltip"
  )

</template>


<script lang="ls">
``
import VueSlider from 'vue-slider-component';
import moment from 'moment';
import 'vue-slider-component/theme/default.css';
``

/* ## marks
  Custom mark formatting function
  @param date {object} Date object
  @return {string} Formatted date string
 */
marks = (date) ->
  extent = @$store.getters.pingExtent
  config = do
    labelStyle:
      'opacity': 0.7
      'font-size': '10px'
      'width': '35px'
      'white-space': 'normal'
      'word-break':'break-word'
    
  if date == 0
    config.label = moment(extent.min).format('ll')
    config
  else if date == extent.days
    config.label = moment(extent.max).format('ll')
    config
  else
    no

/* ## tooltip
  Custom tooltip formatting function
  @param data {object} Date object
  @return {string} Formatted date string
 */
tooltip = (date) ->
  extent = @$store.getters.pingExtent
  d = date
  if date == extent.days then d++
  now = moment(extent.min).add d, 'days'
  now.format 'll'

``
export default {
  name: 'temporalSlider',
  components: {
    VueSlider
  },
  methods: {
    marks,
    tooltip
  },
  data: () => ({
    values: [20,500]
  })
}
``

</script>