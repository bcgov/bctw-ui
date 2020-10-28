<template lang="html">
  <div class="con-select-example">
    <vs-select
      class="selectExample"
      :label="label"
      v-model="selected"
    ><vs-select-item
      v-if="codes"
      :key="item.id"
      :value="item.code"
      :text="item.description"
      v-for="item in codes" /
    ></vs-select>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Select',
  props: {
    label: String,
    header: String
  },
  computed: {
    localComputed () {
    },
    ...mapState({
      codes(state) {
        return state.codeModule.codes[this.header];
      }
    })
  },
  data(){
    return {
      loading: false,
      selected: '',
      error: null,
      
    }
  },
  methods:{
    fetchData() {
      this.error = null;
      this.loading = true;
      this.$store.dispatch('requestCodes', {codeHeader: this.header}).then(d => {
        this.loading = false;
      });
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {
    // this.$store.dispatch('requestCodes', {codeHeader: this.header, callback: cb })
  } 
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