<template>
  <div>
    <state-table 
      v-if="availableCollars" title="Available Collars"
      v-model="availableCollars" :getHeader="getHeader"
      :propsToDisplay="availableCollarProps"
      v-on:page:change="(p)=>loadNewCollars('avail', p)"></state-table>
    <state-table
      v-if="assignedCollars" title="Assigned Collars"
      v-model="assignedCollars" :getHeader="getHeader"
      :propsToDisplay="assignedCollarProps"
      v-on:page:change="(p)=>loadNewCollars('assign', p)"></state-table>
    <vs-divider></vs-divider>
    <div>  
      <vs-button @click="handleExportClick" class="btn-export" type="filled">Export</vs-button>
      <vs-button @click="() => handleEditClick(false)" type="border" >Register New Collar</vs-button>
      <vs-button @click="() => handleEditClick(true)" :disabled="Object.keys(editObject).length === 0"  type="border">See Collar Details</vs-button>
      <!-- <vs-button disabled type="border">Retire Collar</vs-button> -->
    </div>
    <export-modal
      title="Export Collars"
      :active="showExportModal"
      v-on:update:close="close"
      v-bind:value="allCollars"
    ></export-modal>
    <collar-modal 
      :active="showEditModal"
      v-on:update:close="close"
      v-on:save:collar="save"
      :isEdit="isEditMode">
    </collar-modal>
  <!-- <pre>{{editObject}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { Collar, availableCollarProps, assignedCollarProps} from '../../../types/collar'
import { ActionGetPayload } from 'frontend/src/types/store';
import { getNotifyProps } from '../../notify';
import { assignedCritterProps } from 'frontend/src/types/animal';

export default Vue.extend({
  name: 'collars',
  props: {
    title: String,
  },
  data: function() {
    return {
      isEditMode: false,
      showEditModal: false,
      showExportModal: false,
      isError: false,
      selected: {},
      assignedCollarProps: assignedCollarProps,
      availableCollarProps: availableCollarProps
    }
  },
  methods: {
    getHeader: (s: string) => Collar.getTitle(s),
    close() {
      this.showEditModal = false;
      this.showExportModal = false;
    },
    handleEditClick(isEdit: boolean) {
      this.isEditMode = isEdit;
      this.showEditModal = !this.showEditModal;
    },
    handleExportClick() {
      this.showExportModal = !this.showAddModal;
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
        callback: this.cBCollarsLoaded,
        page
      };
      const actionString = type === 'assign' ? 'getAssignedCollars' : 'getAvailableCollars';
      this.$store.dispatch(actionString, payload);
    }
  },
  computed: {
    allCollars() {
      return [...this.assignedCollars, ...this.availableCollars ]
    },
    ...mapGetters(['assignedCollars', 'availableCollars', 'editObject']),
  },
})

const cbCollarSaved = (payload) => {
  console.log(`add_collar success`);
}
</script>

<style scoped>
  /* h3 {
    margin-bottom: 10px;
  } */
  .btn-export {
    float: left;
  }
</style>
