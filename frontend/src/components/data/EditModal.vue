<template>
  <vs-popup 
    class="holamundo" 
    :title="title"
    :active.sync="shouldShow">
    <!-- todo: make inputs inline -->
    <div class="inRow">
      <div v-for="(val, prop) in this.$store.getters.editObject" :key="prop">
        <input-type 
          :label="formatHeader(prop)" 
          :propId="prop"
          :val="val"
          :isDisabled="flagDisabled(prop)"
          v-on:update:model="handleInputChange"
          :isVisible=shouldShow
        />
      </div>
    </div>
    <vs-button
      button="submit"
      @click="save"
      class="btn-save"
      type="border"
      :disabled="!canSave"
    >Save</vs-button>
    <slot></slot>
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
    formatHeader: Function
  },
  data() {
    return {
      cannotEdit: ['device_id', 'max_transmission_date', 'interval', 'animal_id'],
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
    },
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
.inRow {
  display: flex;
  flex-direction: row;
  /* flex-grow: 1; */
  flex-wrap: wrap;
}
.editinput {
  width: calc(100% * (2/3) );
}
</style>