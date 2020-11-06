<template>
  <div v-if="value">
    <!-- bound object passed in from v-model should be array of objects -->
    <vs-table 
      :data="displayed"
      v-model="selected"
      @selected="handleSelect"
      >
      <template slot="header"><h3>{{title}}</h3></template> 
      <template slot="thead">
        <vs-th v-for="(v, p) in displayed[displayed.length - 1]" :key="p">
          {{propsToDisplay.includes(p) ? getHeader(p) : null}}
        </vs-th>
      </template>
      <template slot-scope="">
        <!-- each object in array is a row -->
        <vs-tr v-for="(obj, prop) in displayed" :key="prop" :data="obj">
          <vs-td :key="v" v-for="(k, v) in obj" :data="k">
            {{propsToDisplay.includes(v) ? k : null}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <vs-pagination 
      class="mt-4"
      :total="value.length / limitPerPage + 1"
      v-model="current_page"
      @input="handlePageChange"></vs-pagination>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'StateTable',
  props: {
    getHeader: { type: Function, required: true },
    propsToDisplay: { type: Array, required: true },
    title: { type: String, required: false },
    value: { type: Array, required: true, },
  },
  data: function() {
    return {
      selected: {},
      current_page: 1,
      limitPerPage: 10
    }
  },
  computed: {
    displayed() {
      const start = (this.limitPerPage * (this.current_page - 1));
      const end = start + 9;
      // console.log(`current: ${this.current_page} start: ${start}, end: ${end}`)
      const resultsToDisplay = this.value.filter((v, idx) => {
        return idx >= start && idx <= end;
      })
      return resultsToDisplay;
    }
  },
  methods: {
    handlePageChange(v: number){
      this.current_page = v;
      if (this.value.length < (10 * v)) {
        // console.log('requesting to load more items');
        this.$emit('page:change', v)
      }
    },
    handleSelect(tr: any) {
      this.$store.commit('updateEditObject', tr);
    }
  }
})
</script>