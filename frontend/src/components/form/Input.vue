
<template lang="html">
  <vs-input 
    v-bind:value="value"
    v-on:input="onChange"
    :label="label"
    :disabled="isDisabled"
  ></vs-input>
</template>
<script>
/*
  how to use this component:
    - to bind it to a model: v-model (not :v-model!)
    - to listen to changes: v-on:input
    - to get an object version in the form of {propid : value}: listen to v-on:update:model
*/
export default {
  name: 'Input',
  props: {
    label: String,
    isDisabled: Boolean,
    isVisible: Boolean,
    propId: String, // the non header version ex. device_id
    initialValue: [String, Number, Boolean]
  },
  data(){
    return {
      originalValue: this.value,
      value: this.initialValue,
      visible: this.isVisible
    }
  },
  computed: {
    isChanged() {
      const changed = this.value !== this.originalValue;
      return changed;
    }
  },
  methods: {
    // note: vs-input seems to emit only the value of event.target.value
    // while the original input emits the entire event
    onChange(v) {
      this.value = v;
      this.$emit('input', v);
      this.emitAsObject(v);
    },
    emitAsObject(v) {
      if (this.isChanged) {
        let o = {}
        o[this.propId] = this.value
        this.$emit('update:model', o)
      }
    },
  },
}
</script>

<style lang="stylus">
  .labelx
    .vs-input
      margin 10px;
</style>