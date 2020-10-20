<template>
  <vs-popup 
    class="holamundo" 
    :title="title"
    :active.sync="shouldShow">
    <!-- todo: make inputs inline -->
      <div v-for="(val, prop) in this.$store.getters.editObject" :key="prop">
        <input-type 
          :label="prop" 
          :val="val"
          :isDisabled="flagDisabled(prop)"
          v-on:update:model="handleInputChange"
          :isVisible=shouldShow
        />
      </div>
  <vs-button
    button="submit"
    @click="save"
    class="btn-save"
    type="border"
    :disabled="!canSave"
  >Save</vs-button>
  </vs-popup>
</template>
  
<script>
import Vue from 'vue';
import Input from '../form/Input';

Vue.component('input-type', Input);

export default {
  name: 'EditModal',
  props: {
    title: String,
    active: Boolean,
  },
  data() {
    return {
      cannotEdit: ['Device ID', 'Last Contact', 'Next Update', 'Animal ID'],
      canSave: false,
      changedValues: {}
    }
  },
  methods: {
    // disable editing on these fields
    flagDisabled(v) {
      return this.cannotEdit.indexOf(v) === -1 ? false : true;
    },
    save() {
      this.shouldShow = false;
      const newObj = { ...this.$store.getters.editObject, ...this.changedValues }
      this.$emit('update:save', newObj)
    },
    handleInputChange(e) {
      this.changedValues = {...this.changedValues, ...e}
      this.canSave = true;
    },
    handleClose() {
      this.canSave = false;
    }
  },
  computed: {
    shouldShow: {
      get: function() {
        return this.active;
      },
      set: function(newValue) {
        this.$emit('update:modal', newValue)
        // trigger on closing of modal
        if (!newValue) {
          this.handleClose();
        }
      }
    }
  }
}
</script>

<style>
.btn-save {
  float:right;
}
</style>