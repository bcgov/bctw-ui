<template>
  <vs-popup 
    class="holamundo" 
    :title="title"
    :active.sync="shouldShow">
    <!-- todo: make inputs inline -->
      <div v-for="(val, prop) in editing" :key="prop">
        <input-type 
          :label="prop" 
          :val="val"
          :isDisabled="flagDisabled(prop)"
          v-on:update:model="handleInputChange"
        />
      </div>
  <vs-button button="submit" @click="save" class="btn-save" type="border">Save</vs-button>
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
    editing: Object
  },
  data() {
    return {
      // todo: figure this out...
      cannotEdit: ['Device ID', 'Last Contact', 'Next Update'],
      objectEditing: this.editing
    }
  },
  methods: {
    flagDisabled(v) {
      return this.cannotEdit.indexOf(v) === -1 ? false : true;
    },
    save() {
      // assume the first object key/val is always device/critter id?
      const firstKey = Object.keys(this.editing)[0];
      const firstVal = this.editing[firstKey];
      this.$vs.notify({ title: `saving ${firstKey} ${firstVal}`})
      // todo: save
    },
    handleInputChange(e) {
      const newObj = Object.assign(this.editing, e)
      console.log(`${JSON.stringify(newObj)}`)
      // todo: update data
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

<style>
.btn-save {
  float:right;
}
</style>