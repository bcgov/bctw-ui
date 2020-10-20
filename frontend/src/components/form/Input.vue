<template lang="html">
  <!-- <span class="centerx default-input"> -->
     <vs-input 
        class="inputx"
        v-model="value"
        :label="label"
        :disabled="isDisabled"
        @change="handleChange"
        :isVisible="isVisible"
      />
   <!-- </span> -->
</template>

<script>
export default {
  props: {
    label: String,
    isDisabled: Boolean,
    isVisible: Boolean,
    val: String | Number | Date,
  },
  data(){
    return {
      originalValue: this.val || '',
      value: this.val || '',
      visible: this.isVisible
    }
  },
  methods: {
    isChanged() {
      const changed = this.value !== this.originalValue;
      // console.log(`new: ${this.value} old: ${this.originalValue}`)
      // console.log(changed)
      return changed;
    },
    handleChange(event) {
      if (this.isChanged(event.target.value)) {
        let r = {}
        r[this.label] = this.value
        // console.log(`changed! to ${this.value}`)
        this.$emit('update:model', r)
      }
    },
  },
  watch: {
    // revert value when input is no longer visible (modal)
    //todo: fix
    isVisible: function(newv, oldv) {
      if (newv) { //showing the window? set values to assigned ones
        this.value = this.val
      } else {
        this.value = '';
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