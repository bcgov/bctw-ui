<template>
  <div v-if="value">
    <!-- bound object passed in from v-model should be array of objects -->
    <vs-table :data="value" v-model="selected" @selected="handleSelect">
      <template slot="header"><h3>{{title}}</h3></template> 
      <template slot="thead">
        <!-- iterate first object in the array for headers -->
        <vs-th v-for="(v, p) in value[0]" :key="p">{{p}}</vs-th>
      </template>
      <template slot-scope="">
        <!-- each object in array is a row -->
        <vs-tr v-for="(obj, prop) in value" :key="prop" :data="obj">
          <vs-td :key="v" v-for="(k, v) in obj" :data="k">
            {{k}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'StateTable',
  props: {
    value: {
      type: Array,
      required: true
    },
    title: String,
  },
  data: function() {
    return {
      selected: {}
    }
  },
  methods: {
    handleSelect(tr: any) {
      this.$store.commit('updateEditingObject', tr);
    }
  }
})
</script>