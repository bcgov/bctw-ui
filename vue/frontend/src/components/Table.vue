<template>
  <div v-if="value">
    <!-- bound object passed in from v-model should be array of objects -->
    <vs-table 
      :data="value"
      :noDataText="noDataMsg || 'no data available'"
      v-model="selected"
      @selected="handleSelect"
      >
      <template slot="header"><h3>{{title}}</h3></template> 
      <template slot="thead" v-if="value && value.length">
        <vs-th v-for="p in propsToDisplay" :key="p">
          {{getHeader(p)}}
        </vs-th>
      </template>
      <template slot-scope="">
        <!-- each object in array is a table row -->
        <vs-tr v-for="(obj, prop) in displayed" :key="prop" :data="obj">
          <!-- iterate the properties to display, retrieving the object value at each-->
          <vs-td v-for="(k, i) in propsToDisplay" :key="i" :data="k">
            <!-- <pre>{{obj}} {{k}} {{prop}}</pre> -->
            <p class="td">{{formatTableData(obj[k])}}</p>
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <vs-pagination v-if="paginate"
      class="mt-4"
      :total="value.length / limitPerPage + 1"
      v-model="current_page"
      @input="handlePageChange"></vs-pagination>
  </div>
</template>
<script lang="ts">
import moment from 'moment';
import Vue from 'vue'

export default Vue.extend({
  name: 'StateTable',
  props: {
    getHeader: { type: Function, required: true },
    propsToDisplay: { required: true },
    noDataMsg: {type: String, required: false},
    title: { type: String, required: false },
    value: { type: Array, required: true, },
    paginate: {type: Boolean, required: false, default: true },
    // what uniquely identifies a row. needs to be supplied when there are multiple tables in the view!
    rowIdentifier: {type: String, required: false } 
  },
  data: function() {
    return {
      selected: {},
      current_page: 1,
      limitPerPage: 10,
    }
  },
  methods: {
    formatTableData(td: any) {
      if (moment.isMoment(td)) {
        return td.isValid() ? td.format('DD-MM-YYYY HH:mm:ss') : '';
      } return td;
    },
    handlePageChange(v: number){
      if (this.value.length && this.value.length < this.limitPerPage) {
        return;
      }
      this.current_page = v;
      if (this.value.length < (10 * v)) {
        this.$emit('page:change', v)
      }
    },
    handleSelect(tr: any) {
      this.$store.commit('updateEditObject', tr);
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
    },
    editObject() {
      return this.$store.getters.editObject;
    }
  },
  watch: {
    // for views that display multiple pages, if this row isnt in the same table, wipe the selected value
    editObject(v) {
      const inThisTable = this.displayed.find((row: any) => row[this.rowIdentifier] === v[this.rowIdentifier]);
      if (!inThisTable) {
        this.selected = {};
      }
    }
  }
})
</script>

<style scoped>
  .td {
    margin: 0px;
    text-align: left;
  }
</style>