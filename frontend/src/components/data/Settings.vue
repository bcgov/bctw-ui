<template>
  <div>
    <h3>Code Management Settings</h3>
    <vs-divider></vs-divider>
    <file-input name="csv" title="Bulk upload codes"></file-input>
    <vs-divider></vs-divider>
    <input-select
      header="region"
      label="Region"
    ></input-select>
    <vs-divider></vs-divider>
    <vs-button type="border" @click="handleAddClick">Add New Code Type</vs-button>
    <add-code
      :active="showAddCodeHeader"
      v-on:update:modal="handleAddClick"
    ></add-code>
    <vs-divider></vs-divider>
    <div v-if="headers.length" style="margin-top: 20px">
      <span v-for="header in headers" v-bind:key="header.id">
        <vs-button 
          style="margin-right: 10px"
          type="border"
          class="btn-setting"
          @click="() => handleSelectHeaderselected(header)"
        >{{header.type}}</vs-button>
      </span>
      <div v-if="headers && codes && codes[selected.type]">
        <p>{{selected.description}}</p>
        <vs-list v-for="code in codes[selected.type]" :key="code.id">
          <vs-list-item :title="code.code" :subtitle="code.description"></vs-list>
      </div>
      <div v-else><p>no codes found for this code type</p></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AddCodeHeader from './codes/AddCodeHeader';
import { ICode } from '../../types/code';
import { mapState } from 'vuex';
Vue.component('add-code', AddCodeHeader);

export default {
  name: 'Settings',
  data () {
    return {
      headers: [],
      selected: {},
      showAddCodeHeader: false,
    }
  },
  computed: {
    localComputed () {
    },
    ...mapState({
      codes(state) {
        return state.codeModule.codes //[this.selected.type]
      }
    })
  },
  methods: {
    handleAddClick() {
      this.showAddCodeHeader = !this.showAddCodeHeader;
    },
    handleSelectHeaderselected(header: ICode) {
      this.selected = header;
      let codes = this.$store.getters.codes[header.type]; //codeModule.codes;
      // console.log(`header selected: codes are ${JSON.stringify(codes)}`);
      if (!codes) {
        this.$store.dispatch('requestCodes', {body: header.type, callback: this.loadCodeCb})
      }
    },
    loadedHeadersCb(body: ICode[]) {
      this.headers = body;
    },
    loadCodeCb(body: ICode[]) {
      // console.log(body);
    }
  },
  mounted() {
    this.$store.dispatch('requestHeaders', {callback: this.loadedHeadersCb})
  }
}
</script>

<style scoped>
  h3 {
    margin-bottom: 10px;
  }
</style>