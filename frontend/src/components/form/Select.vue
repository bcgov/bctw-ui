<template lang="html">
  <div class="con-select-example">
    <vs-select
      class="selectExample"
      :label="loading ? 'Loading...' : label"
      :autocomplete="!!autocomplete"
      v-model="selected"
      v-on:change="$emit('change:select', $event)"
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
export default {
  name: 'Select',
  props: {
    label: String,
    header: String, // required 
    autocomplete: String,
    val : [String, Number]
  },
  data(){
    return {
      loading: false,
      selected: '',
      error: null,
    }
  },
  computed: {
    // todo: disable while loading
    localComputed () {
      // disabled () {
      //   return this.loading;
      // }
    },
    ...mapState({
      codes(state) {
        return state.codeModule.codes[this.header];
      }
    })
  },
  methods:{
    onChange(v) {
      console.log(this.val)
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
    this.fetchData();
  },
}
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