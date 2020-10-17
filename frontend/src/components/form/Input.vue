<template lang="html">
  <!-- <span class="centerx default-input"> -->
     <vs-input 
        class="inputx"
        v-model="value"
        :label="label"
        :disabled="isDisabled"
        @change="handleChange"
      />
   <!-- </span> -->
</template>

<script>
export default {
  props: {
    label: String,
    isDisabled: Boolean,
    val: String | Number | Date
  },
  data(){
    return {
      value: this.val
    }
  },
  methods: {
    isChanged(val) {
      return val !== this.val
    },
    handleChange(event) {
      if (this.isChanged(event.target.value)) {
        let r = {}
        r[this.label] = this.value
        // console.log(`changed! to ${this.value}`)
        this.$emit('update:model', r)
      }
    }
  }
}
</script>

<style lang="stylus">
  .labelx
    .vs-input
      margin 10px;
</style>