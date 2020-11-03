<template>
  <div v-if="value">
    <!-- bound object passed in from v-model should be array of objects -->
    <vs-table :data="value" v-model="selected" @selected="handleSelect">
      <template slot="header"><h3>{{title}}</h3></template> 
      <template slot="thead">
        <vs-th v-for="(v, p) in value[0]" :key="p">
          {{propsToDisplay.includes(p) ? getHeader(p) : null}}
        </vs-th>
      </template>
      <template slot-scope="">
        <!-- each object in array is a row -->
        <vs-tr v-for="(obj, prop) in value" :key="prop" :data="obj">
          <vs-td :key="v" v-for="(k, v) in obj" :data="k">
            {{propsToDisplay.includes(v) ? k : null}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
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
      selected: {}
    }
  },
  computed: {
  },
  methods: {
    handleSelect(tr: any) {
      this.$store.commit('updateEditObject', tr);
    }
  }
})
</script>