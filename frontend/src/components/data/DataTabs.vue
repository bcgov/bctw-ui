<template>
<!--
  todo:
  - move tabs to left side of page stacked vertically
-->
  <div class="ss">
    <vs-tabs>
      <vs-tab
        v-for="item in items"
        :key="item.key"
        :label="item.title"
        :disabled="item.disabled"
      >
        <div class="con-tab-ejemplo">
          <component :is="item.component"></component>
        </div>
      </vs-tab>
    </vs-tabs>
  </div>
</template>

<script>
import Collar from './Collar';
import Animal from './Animal';
import Settings from './Settings';

export default {
  name: 'dataTabs',
  data: function() {
    return { }
  },
  computed: {
    items() {
      return [
        { title: 'Settings', disabled: false, key: 2, component: Settings },
        { title: 'Critters', disabled: false, key: 0, component: Animal },
        { title: 'Collars', disabled: false, key: 1, component: Collar },
        { title: 'Profile', disabled: true, key: 3 }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

