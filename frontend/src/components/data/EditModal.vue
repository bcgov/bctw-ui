<template>
  <vs-popup 
    class="holamundo" 
    title="Lorem ipsum dolor sit amet"
    :active.sync="shouldShow">
    <p>
      Lorem ipsum dolor sit amet.
    </p>
  </vs-popup>
</template>
  
<script>
export default {
  name: 'EditModal',
  props: {
    active: Boolean
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

<style scoped>
</style>