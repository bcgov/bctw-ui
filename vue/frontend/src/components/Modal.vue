<template>
    <!-- :class="['con-vs-popup', 'vs-popup']" -->
  <vs-popup 
    class="holamundo" 
    :title="title"
    :active.sync="shouldShow">
    <slot></slot>
  </vs-popup>
</template>

<script>
export default {
  name: 'modal',
  props: {
    title: String,
    active: Boolean,
  },
  computed: {
    shouldShow: {
      get: function() {
        return this.active;
      },
      set: function(newValue) {
        this.$emit('update:modal', newValue)
      }
    }
  },
}
</script>

<style scoped>
/* .con-vs-popup .vs-popup { 
  width: 1200px;
}
.con-vs-popup .vs-popup {
  width: 100% !important;
  height: auto !important;
} */
</style>