<template lang="html">
  <vs-checkbox
    v-bind:value="value"
    v-on:change="onChange"
    :label="label"
    :disabled="isDisabled"
  >{{this.label}}</vs-checkbox>
</template>

<script lang="ts">
export default {
  name: 'Checkbox',
  props: {
    label: String,
    isDisabled: Boolean,
    propId: String,
  },
  data(){
    return {
      value: false
    }
  },
  methods: {
    onChange() {
      this.value = !this.value;
      // emit to model (v-model directive in component)
      this.$emit('input', this.value);
    }
  }
}
</script>