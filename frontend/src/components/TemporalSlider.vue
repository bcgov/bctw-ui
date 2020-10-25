<style lang="stylus" scoped>
.temporal-slider
  margin 1rem
  width 220px
</style>


<template lang="pug">

.temporal-slider
  VueSlider(
    v-model="values"
    :min="0"
    :max="200"
    :max-range="50"
  )

</template>


<script lang="ls">
``
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
``


``
export default {
  name: 'temporalSlider',
  components: {
    VueSlider
  },
  data: () => ({
    values: [20,50]
  })
}
``

</script>