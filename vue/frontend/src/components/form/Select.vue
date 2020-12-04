<template lang="html">
  <div class="con-select-example">
      <!-- v-on:change="$emit('change:select', $event)" -->
      <!-- todo: fix v-model to not require parent handler -->
      <!-- v-if="$store.getters.codes[this.header] && $store.getters.codes[this.header].length" -->
    <vs-select
      class="selectExample"
      :label="loading ? 'Loading...' : label"
      :autocomplete="!!autocomplete"
      v-model="selected"
      v-on:change="$emit('change:select', {[header]: $event})"
    ><vs-select-item
      :key="item.id"
      :value="item.code"
      :text="item.description"
      v-for="item in $store.getters.codes[this.header]"
    ></vs-select>
  </div>
</template>

<script lang="ts">
/*
  - to bind the changes of this component to state
  use the v-on:change directive 
*/
// import { mapState, mapGetters } from 'vuex';
import Vue from 'vue';

export default Vue.extend({
  name: 'Select',
  props: {
    label: { type: String, required: false },
    header: { type: String, required: true },
    autocomplete: { type: String, required: false },
    val : [String, Number]
  },
  data(){
    return {
      loading: false as boolean,
      selected: '' as string,
      error: null,
    }
  },
  computed: {
    // todo: disable while loading
    disabled () {
      return this.loading;
    },
  },
  methods:{
    fetchData() {
      this.error = null;
      this.loading = true;
      this.$store.dispatch('requestCodes', {body: this.header}).then(d => {
        this.loading = false;
      });
    }
  },
  created() {
    this.fetchData();
  },
  watch: {
    // set selected to val when changed
    val(v) {
      this.selected = v || '';
    }
  }
})
</script>

<style lang="css">
.con-select-example {
  display: flex;
  align-items: center;
  justify-content: center; 
}
.con-select .vs-select {
  width: 100%
}
@media (max-width: 550px) {
  .con-select {
    flex-direction: column;
  }
  .con-select .vs-select {
    width: 100%
  }
}
</style>