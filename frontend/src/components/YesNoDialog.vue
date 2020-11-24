<template>
  <modal class='container'
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
  <div class='modal_text'>
    {{msg}}
  </div>
  <div class='btn_row'>
    <vs-button @click="$emit('update:selected', true)">{{btnYesText}}</vs-button>
    <vs-button @click="$emit('update:selected', false)">{{btnNoText}}</vs-button>
  </div>
</modal>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'YesNoDialog',
  props: {
    active: { type: Boolean, default: false, required: true },
    msg: { type: String, default: '' },
    btnYesText: { type: String, required: false, default: 'Yes' },
    btnNoText: { type: String, required: false, default: 'No' },
    title: {type: String, required: true }
  },
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
.btn_row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 50px;
}
.modal_text {
  text-align: center;
  padding: 20px 0px;
}
</style>