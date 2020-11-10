<template>
  <div>
    <h3>Code Management</h3>
    <vs-divider></vs-divider>
    <file-input name="csv" title="Bulk upload codes"></file-input>
    <vs-divider></vs-divider>
    <h4>sample code select component</h4><br/>
    <div class='testform'>
      <input-select header="region" label="Region"></input-select>
      <input-select header="species" label="Species"></input-select>
      <input-select header="animal_status" label="Animal Status"></input-select>
    </div>
    <vs-divider></vs-divider>
    <h4>sample component for adding a new code header</h4><br/>
    <vs-button type="border" @click="handleAddClick">Add Code Type</vs-button>
    <add-code :active="showAddCodeHeader" v-on:update:close="handleAddClick"></add-code>
    <vs-divider></vs-divider>
    <h4>click a button to view its codes</h4><br/>
    <div v-if="headers.length" style="margin-top: 20px">
      <span v-for="header in headers" v-bind:key="header.id">
        <vs-button 
          style="margin-right: 10px"
          type="border"
          class="btn-setting"
          @click="() => handleSelectHeaderselected(header)"
        >{{header.type}}</vs-button>
      </span>
      <vs-divider></vs-divider>
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
import { ICode } from '../../types/code';
import { mapState } from 'vuex';

export default Vue.extend({
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
      let codes = this.$store.getters.codes[header.type];
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
})
</script>

<style scoped>
  .testform {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  h3 {
    margin-bottom: 10px;
  }
</style>