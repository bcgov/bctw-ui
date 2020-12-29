<template>
  <div>
    <h2>Code Management</h2>
    <vs-divider></vs-divider>
    <div class="section">
      <h3>Code Types</h3>
      <p>All codes belong to a code type. For example the code "Kootenay" could belong to the code type "Region".</p>
      <vs-button @click="handleAddHeaderClick">Add New Code Type</vs-button>
      <vs-button @click="handleImportClick">Bulk Import New Codes</vs-button>
      <add-code :active="showAddCodeHeader" v-on:update:close="handleAddHeaderClick"></add-code>
      <import-modal
        title="Bulk Import Codes"
        message="Use this feature to add multiple codes. Codes cannot be edited here.
        The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional."
        :active="showImport"
        v-on:update:close="handleImportClick"></import-modal>
    </div>
    <vs-divider></vs-divider>
    <div class="section">
    <h3>Existing Code Types</h3>
    <div v-if="headers.length" style="margin-top: 20px">
      <vs-button v-for="(header, idx) in headers" :key="idx"
        style="margin-right: 10px"
        type="border"
        size="small"
        class="btn-setting"
        @click="handleSelectHeaderselected(header)"
      >{{header.title}}</vs-button>
    </div>
    <vs-divider></vs-divider>
    <div v-if="selected.type">
      <p><b>When importing new {{selected.title}} codes, use <i>{{selected.type}}</i> as the Code Type</b></p>
      <p><i>{{`${selected.description || 'no description available'}`}}</i></p>
    </div>
    <div class="section" v-if="codes && codes[selected.type]">
      <state-table
        :getHeader="(str) => str"
        :title="`${selected.title} Codes`"
        :propsToDisplay="['id', 'code', 'description']"
        v-model="codes[selected.type]"
      ></state-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICode, ICodeHeader } from '../../types/code';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'Settings',
  data () {
    return {
      headers: [] as ICodeHeader[],
      user: this.$store.getters.testUser,
      selected: {},
      showAddCodeHeader: false,
      showImport: false,
    }
  },
  computed: {
    codes() {
      return this.$store.getters.codes;
    }
  },
  methods: {
    handleAddHeaderClick() {
      this.showAddCodeHeader = !this.showAddCodeHeader;
    },
    handleImportClick() {
      this.showImport = !this.showImport;
    },
    handleSelectHeaderselected(header: ICode) {
      this.selected = header;
      let codes = this.$store.getters.codes[header.type];
      if (!codes) {
        this.$store.dispatch('requestCodes', {body: header.type, callback: this.loadCodeCb})
      }
    },
    loadedHeadersCb(body: ICodeHeader[]) {
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
  h3 {
    margin-bottom: 10px;
  }
</style>