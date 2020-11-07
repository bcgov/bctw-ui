<style lang="stylus">
.temporal-slider
  margin 1rem
  width 210px

.vue-slider-dot-tooltip-inner
  width 50px !important
  white-space normal !important

.fetch-data
  float right !important
  margin 2rem 0rem
  width 10rem
  padding 0.5rem 0.8rem 0.5rem 0.5rem !important

.timeline
  display grid
  grid-template-columns 3.5rem 1fr 3.5rem

  .start
    font-size 12px
    cursor pointer
  .start:hover,.end:hover
    color #037ffc
    font-font-weight bolder
  .end
    font-size 12px
    cursor pointer
  .between
    font-size 11px
    color rgba(0,0,0,0.5)
    margin-top -0.4rem
</style>


<template lang="pug">

.temporal-slider
  .timeline
    .start {{tooltip($store.getters.timeWindow[0])}}
    .between
      vs-divider {{$store.getters.timeWindow[1] - $store.getters.timeWindow[0]}} days
    .end {{tooltip($store.getters.timeWindow[1])}}

  //- v-date-picker(
  //-   v-model="$store.getters.timeWindow[0]"
  //- )

  VueSlider(
    v-model="timeWindow"
    :min=0
    :max="$store.getters.pingExtent.days"
    :max-range="1000"
    :marks="marks"
    :interval="1"
    :tooltip="'none'"
    @drag-start="countDownStop"
    @drag-end="countDownStart"
  )
  vs-button(
    icon="play_arrow"
    size="small"
    class="fetch-data"
    :disabled="count == 0"
    @click="requestCollars"
  ) Fetching Data in {{count}}

</template>


<script lang="ls">
``
import VueSlider from 'vue-slider-component';
import moment from 'moment';
import 'vue-slider-component/theme/default.css';
import {bus} from '../main';
``


countDownStart = ->
  #// Reset counter
  @count = 5 
  if @counter then clearInterval that
  
  @counter = setInterval( ~>
    --@count
    if @count < 1
      @$vs.loading do
        container: '#critter-list'
        type: 'sound'

      callback = ~>
        @$vs.loading.close '#critter-list > .con-vs-loading'
        bus.$emit 'refreshCritterLayers' #// Signal map to refresh collar layer

      clearInterval @counter
      @counter = null
      @$store.dispatch 'requestPings', callback
  ,1000)

countDownStop = -> if @counter then clearInterval that

requestCollars = ->
  @$vs.loading do
    container: '#critter-list'
    type: 'sound'

  callback = ~>
    @$vs.loading.close '#critter-list > .con-vs-loading'
    bus.$emit 'refreshCritterLayers' #// Signal map to refresh collar layer

  countDownStop.call @
  @count = 0
  @counter = null
  @$store.dispatch 'requestPings', callback

console.log 'reqestCollars'


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
  console.log date
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
    tooltip,
    countDownStart,
    countDownStop,
    requestCollars
  },
  data: () => ({
    counter: null,
    count: 0
  }),
  computed: {
    timeWindow:{
      get(){return this.$store.getters.timeWindow;},
      set(value){this.$store.commit('writeTimeWindow',value);}
    }
  }
}
``

</script>