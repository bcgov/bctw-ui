<template>
  <modal
    title="Export Collars"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
  <vs-chip 
    @click="remove(chip)"
    v-for="(chip, idx) in chips"
    :key="idx"
    closable
  >{{chip}}</vs-chip>
  <div>
    <vs-button @click="click">Export</vs-button>
  </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { getTypeExportFields } from '../component_helpers';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'export type',
  props: {
    active: { type: Boolean, required: true },
  },
  data: function() {
    return {
      chips: [] as string[] 
    }
  },
  methods: {
    remove (item: any) {
      this.chips.splice(this.chips.indexOf(item), 1)
    },
    click() {
      console.log('im clicked');
    }
  },
  computed: mapGetters(['assignedAnimals']),
  watch: {
    active(v) {
      if (v && this.assignedAnimals?.length) {
        this.chips = [...getTypeExportFields(this.assignedAnimals[0])];
      }
    }
  }
})
</script>

<style scoped>
</style>