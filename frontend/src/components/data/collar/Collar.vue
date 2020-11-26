<template lang="html">
  <div>
    <state-table 
      v-if="availableCollars" title="Available Collars"
      v-model="availableCollars" :getHeader="getHeader"
      noDataMsg="no unassigned collars available"
      :propsToDisplay="availableCollarProps"
      rowIdentifier="device_id"
      v-on:page:change="(p)=>loadNewCollars('avail', p)"></state-table>
    <state-table
      v-if="assignedCollars" title="Assigned Collars"
      v-model="assignedCollars" :getHeader="getHeader"
      rowIdentifier="device_id"
      noDataMsg="no assigned collars available"
      :propsToDisplay="assignedCollarProps"
      v-on:page:change="(p)=>loadNewCollars('assign', p)"></state-table>
    <vs-divider></vs-divider>
    <div>  
      <vs-button @click="handleImportClick" class="btn-left" type="filled">Bulk Import</vs-button>
      <vs-button @click="handleExportClick" class="btn-left" type="filled">Export</vs-button>
      <vs-button @click="handleAddClick" type="border">Register New Collar</vs-button>
      <vs-button @click="handleEditClick" :disabled="Object.keys(editObject).length === 0"  type="border">See Collar Details</vs-button>
    </div>

    <import-modal
      title="Bulk Import VHF Collars"
      message="Use this feature to add multiple new collars."
      :active="showImportModal"
      v-on:update:close="close">
    </import-modal>

    <export-modal
      title="Export Collars"
      :active="showExportModal"
      v-on:update:close="close"
      v-bind:value="[...this.assignedCollars, ...this.availableCollars]"
    ></export-modal>

    <collar-modal 
      :active="showEditModal"
      v-on:update:close="close"
      v-on:save:collar="save"
      :isEdit="isEditMode"
    ></collar-modal>

    <yes-no
      title="Select Collar Type"
      msg="What type of collar would you like to add?"
      :active="showAddCollarTypeModal"
      btnYesText="VHF Collar"
      btnNoText="Vectronics Collar"
      v-on:update:close="close"
      v-on:update:selected="handleCollarTypeSelected"
    ></yes-no>
  <!-- <pre>{{editObject}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collar, availableCollarProps, assignedCollarProps, getCollarTitle, NewCollarType } from '../../../types/collar'
import { ActionGetPayload } from 'frontend/src/types/store';
import { getNotifyProps } from '../../notify';
import { assignedCritterProps } from 'frontend/src/types/animal';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'collars',
  props: {
    title: String,
  },
  data: function() {
    return {
      assignedCollarProps: assignedCollarProps,
      availableCollarProps: availableCollarProps,
      isEditMode: false,
      isError: false,
      selected: {},
      showAddCollarTypeModal: false,
      showEditModal: false,
      showExportModal: false,
      showImportModal: false,
    }
  },
  methods: {
    getHeader: (s: string) => getCollarTitle(s),
    close() {
      this.showEditModal = false;
      this.showImportModal = false;
      this.showExportModal = false;
      this.showAddCollarTypeModal = false;
    },
    handleAddClick() {
      this.isEditMode = false;
      this.showAddCollarTypeModal = !this.showAddCollarTypeModal;
    },
    handleCollarTypeSelected(isVHF: boolean) {
      this.$store.commit('updateNewCollarType', isVHF ? NewCollarType.VHF : NewCollarType.Vect);
      this.showAddCollarTypeModal = false;
      this.showEditModal = !this.showEditModal
    },
    handleEditClick() {
      this.isEditMode = true;
      this.showEditModal = !this.showEditModal;
    },
    handleImportClick(): void {
      this.showImportModal = !this.showImportModal;
    },
    handleExportClick(): void {
      this.showExportModal = !this.showExportModal;
    },
    save() {
      this.close();
    },
    cBCollarsLoaded(body: any, err?: Error | string) {
      if (err) {
        this.isError = true;
        this.$vs.notify(getNotifyProps(err, true));
      }
      console.log(this.isError)
    },
    loadNewCollars(type: 'assign' | 'avail', page: number = 1) {
      const payload:ActionGetPayload = {
        callback: () => console.log('add collar success'),
        page
      };
      const actionString = type === 'assign' ? 'getAssignedCollars' : 'getAvailableCollars';
      this.$store.dispatch(actionString, payload);
    }
  },
  computed: mapGetters([
    'assignedCollars',
    'availableCollars',
    'editObject']),
});
</script>

<style scoped>
  .btn-left {
    float: left;
    margin-right: 5px;
  }
</style>
