<template>
<div v-if="collars">
  <!-- <state-table title="Assign a Collar" v-model="collars"></state-table><br/> -->
  <pre>{{collars}}</pre>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex';
export default Vue.extend({
  name: 'AssignCollar',
  data: function() {
  },
  computed: mapState({ 
    collars: 'availableCollars',
  }),
  methods: {

  },
  mounted() {
    console.log('asoifjsdiofajofjoi')
    this.$store.dispatch('requestCollars', () => console.log('done loading collars'));
  }
})
</script>