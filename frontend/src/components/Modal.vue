<template>
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
    //handleClose: any// Function
  },
  data() {
    return {
    }
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
  }
}
</script>