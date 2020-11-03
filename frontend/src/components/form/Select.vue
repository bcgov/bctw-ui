<template lang="html">
  <div class="con-select-example">
      <!-- v-on:change="$emit('change:select', $event)" -->
      <!-- todo: fix v-model to not require parent handler -->
    <vs-select
      class="selectExample"
      :label="loading ? 'Loading...' : label"
      :autocomplete="!!autocomplete"
      v-model="selected"
      v-on:change="$emit('change:select', {[header]: $event})"
    ><vs-select-item
      v-if="codes"
      :key="item.id"
      :value="item.code"
      :text="item.description"
      v-for="item in codes"
    ></vs-select>
  </div>
</template>

<script lang="ts">
/*
  - to bind the changes of this component to state
  use the v-on:change directive 
*/
import { mapState } from 'vuex';
import Vue from 'vue';

export default Vue.extend({
  name: 'Select',
  props: {
    label: String,
    header: String, // required 
    autocomplete: String,
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
    ...mapState({
      codes(state) {
        return state.codeModule.codes[this.header];
      }
    })
  },
  methods:{
    onChange(v) {
      console.log(`changed to: ${v}`);
    },
    fetchData() {
      this.error = null;
      this.loading = true;
      this.$store.dispatch('requestCodes', {body: this.header}).then(d => {
        this.loading = false;
      });
    }
  },
  created() {
    console.log(this.val);
    this.fetchData();
  },
})

const cb = () => {
}
</script>

<style lang="css">
.selectExample {
  /* margin: 10px; */
}
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