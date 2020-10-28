<template>
  <div>
    <h3>Code Management Settings</h3>
    <file-input name="csv"></file-input>
    <br/>
    <input-select
      header="region"
      label="Region"
    ></input-select>
    <vs-button type="border" @click="handleAddClick">Add New Code Type</vs-button>
    <add-code
      :active="showAddCodeHeader"
      v-on:update:modal="handleAddClick"
    ></add-code>
  </div>
</template>

<script>
import Vue from 'vue';
import AddCodeHeader from './codes/AddCodeHeader';
Vue.component('add-code', AddCodeHeader);

export default {
  name: 'Settings',
  data () {
    return {
      showAddCodeHeader: false
    }
  },
  methods: {
    handleAddClick() {
      this.showAddCodeHeader = !this.showAddCodeHeader;
    }
  }
}
</script>

<style scoped>
h3 {
  margin-bottom: 10px;
}
</style>