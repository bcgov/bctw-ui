<style lang="stylus" scoped>
.temporal-slider
  margin 1rem
  width 220px
</style>


<template lang="pug">

.temporal-slider
  VueSlider(
    v-model="values"
    :min=0
    :max="$store.getters.pingExtent.days"
    :max-range="1000"
    :marks="marks"
  )

</template>


<script lang="ls">
``
import VueSlider from 'vue-slider-component';
import moment from 'moment';
import 'vue-slider-component/theme/default.css';
``

marks = (date) ->
  extent = @$store.getters.pingExtent
  config = do
    labelStyle:
      opacity: 0.7
    
  if date == 0
    config.label = 'first'
    config
  else if date == extent.days
    config.label = 'yo'
    config
  else
    no


``
export default {
  name: 'temporalSlider',
  components: {
    VueSlider
  },
  methods: {
    marks
  },
  data: () => ({
    values: [20,500]
  })
}
``

</script>