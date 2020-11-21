<template lang="html">
  <div >
    <state-table
      title="Animals with Collars"
      v-model="assignedAnimals"
      noDataMsg="no animals available"
      :getHeader="getHeader"
      rowIdentifier="id"
      :propsToDisplay="toDisplayAssigned"
      v-on:page:change="(p) => loadNewAnimals(p, 1)">
    </state-table><br>

    <state-table
      title="Animals without Collars"
      v-model="unassignedAnimals"
      noDataMsg="no animals available"
      rowIdentifier="id"
      :getHeader="getHeader"
      :propsToDisplay="toDisplayUnassigned"
      v-on:page:change="(p) => loadNewAnimals(p, 0)">
    </state-table><br><vs-divider></vs-divider>

    <vs-button @click="handleImportClick" class="btn-left" type="filled">Bulk Import</vs-button>
    <vs-button @click="handleExportClick" class="btn-left" type="filled">Export</vs-button>
    <vs-button @click="() => handleEditClick(false)" type="border">Add Individual</vs-button>
    <vs-button @click="() => handleEditClick(true)" :disabled="Object.keys(editObject).length === 0" type="border">Edit Individual</vs-button>

    <import-modal
      title="Bulk Import Animals"
      message="Use this feature to add multiple new animals. Animals cannot be updated from this feature."
      :active="showImportModal"
      v-on:update:close="close"></import-modal>

    <export-modal
      title="Export Animals"
      :active="showExportModal"
      v-on:update:close="close"
      v-bind:value="assignedAnimals"></export-modal>

    <add-animal
      :active="showAddModal"
      v-on:update:close="close"
      v-on:save:animal="save"
      :isEdit="isEditMode"></add-animal>
    <!-- <pre>{{editObject}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { ActionCallback, ActionGetPayload, ActionPostPayload } from '../../../types/store';
import { Animal, assignedCritterProps, unassignedCritterProps } from '../../../types/animal'
import { getNotifyProps } from '../../notify';

export default Vue.extend({
  name: 'animals',
  computed: mapGetters(['assignedAnimals', 'unassignedAnimals', 'editObject']),
  props: {
    title: String,
  },
  data: function() {
    return {
      isEditMode: false,
      showAddModal: false,
      showExportModal: false,
      showImportModal: false,
      toDisplayAssigned: assignedCritterProps,
      toDisplayUnassigned: unassignedCritterProps,
    }
  },
  methods: {
    close() {
      this.showAddModal = false;
      this.showExportModal = false;
      this.showImportModal = false;
    },
    handleEditClick(isEdit: boolean) {
      this.isEditMode = isEdit;
      this.showAddModal = !this.showAddModal;
    },
    handleExportClick() {
      this.showExportModal = !this.showAddModal;
    },
    handleImportClick() {
      this.showImportModal = !this.showImportModal;
    },
    save() {
      // console.log('Animal: an animal was saved!')
    },
    getHeader: (str: string) => Animal.getTitle(str),
    cbLoadCritters: (body: any, err?: Error | string): void => {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
    },
    loadNewAnimals(page: number = 1, isAssign: number) {
      const payload: ActionGetPayload = {
        callback: this.cbLoadCritters,
        page,
      }
      if (isAssign) {
        this.$store.dispatch('getAssignedAnimals', payload);
      } else {
        this.$store.dispatch('getUnassignedAnimals', payload);
      }
    }
  },
  mounted() {
    // this.$store.dispatch('getAnimals', {callback: this.cbLoadCritters});
  }
});
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
.btn-left {
  float: left;
  margin-right: 5px;
}
</style>

