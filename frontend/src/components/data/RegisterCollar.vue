<template>
  <vs-popup 
    class="holamundo" 
    title="Register A New Vectronics Collar"
    :active.sync="show">
    <p>lets add a collar!</p>
    <vs-button button="submit" @click="save" class="btn-save" type="border">Save</vs-button>
  </vs-popup>
</template>

<script>
export default {
  name: 'RegisterCollarModal',
  props: {
    active: Boolean,
  },
  data() {
    return {

    }
  },
  methods: {
    save() {

    }
  },
  computed: {
    show: {
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
.btn-save {
  float:right;
}
</style>