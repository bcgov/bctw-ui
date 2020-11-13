<template>
  <modal
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
  <h3>Included in export</h3><vs-divider></vs-divider>
  <vs-chip 
    @click="remove(chip)"
    v-for="(chip, idx) in chips" :key="idx"
    color="#24c1a0" closable>
    <p class="chip chip-inc">{{chip}}</p>
  </vs-chip><vs-divider></vs-divider>

  <h3>Excluded from export</h3><vs-divider></vs-divider>
   <vs-chip 
    @click="add(chip)" 
    v-for="(chip, idx) in excludedChips" :key="`${idx}:${chip}`"
    close-icon="add" color="warning" closable>
    <p class="chip chip-exc">{{chip}}</p>
  </vs-chip><vs-divider></vs-divider>

  <div>
    <vs-button type="gradient" class='btn-right' @click="download">Download</vs-button>
    <vs-button color="success" type="gradient" size="small" icon="refresh" class='btn-left' @click="reset">Reset</vs-button>
    <vs-button :disabled="this.chips.length === 0" color="success" type="gradient" size="small" icon="redo" class='btn-left' @click="uncheckAll">Remove All</vs-button>
  </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import download from 'downloadjs';
import { Animal } from 'frontend/src/types/animal';
import { Collar } from 'frontend/src/types/collar';
import { getTypeExportFields } from '../component_helpers';
import { filterObj } from '../../api/api_helpers';
import moment from 'moment';

export default Vue.extend({
  name: 'export',
  props: {
    title: {type: String, required: true},
    active: { type: Boolean, required: true },
    value: { required: true, default: []},
  },
  data: function() {
    return {
      chips: [] as string[],
      excludedChips: [] as string[]
    }
  },
  methods: {
    remove (item: any) {
      let removed = this.chips.splice(this.chips.indexOf(item), 1)[0];
      this.excludedChips.push(removed);
    },
    add (item: any) {
      let removed = this.excludedChips.splice(this.excludedChips.indexOf(item), 1)[0];
      this.chips.push(removed);
    },
    download() {
      const mapped = this.value.map((val:Animal | Collar) => filterObj(val, this.chips));
      download(JSON.stringify(mapped), `download_${moment().format('YYYY_MM_DD')}.csv`, 'text/csv');
    },
    reset() {
      this.chips = [...getTypeExportFields(this.value[0])];
      this.excludedChips.length = 0;
    },
    uncheckAll() {
      this.excludedChips = [...this.excludedChips, ...this.chips.splice(0)];
    }
  },
  watch: {
    active(v) {
      if (v && this.value?.length) {
        this.reset();
      }
    }
  }
})
</script>

<style scoped>
  .btn-left {
    float: left;
    margin-right: 5px;
  }
  .btn-right {
    float: right;
  }
  .chip {
    font-weight: 500;
    font-size: 14px;
  }
</style>