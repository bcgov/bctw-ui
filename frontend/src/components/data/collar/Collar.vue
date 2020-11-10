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
      <vs-button type="border" @click="handleRegisterClick">Register New Collar</vs-button>
      <vs-button disabled type="border">Retire Collar</vs-button>
      <vs-button :disabled="Object.keys(editObject).length === 0" @click="handleEditClick" type="border">See Collar Details</vs-button>
    </div>
    <edit-modal 
      v-on:update:close="close"
      v-on:update:save="save"
      :active="showEditModal"
      title="Edit Collar"
      :editing="selected"
      :getHeader="getHeader"
    ></edit-modal>
    <register-modal 
      v-on:update:close="close" 
      :active="showRegisterModal"
      title="Register A New Vectronics Collar"
    ></register-modal>
  <!-- <pre>{{editObject}}</pre> -->
  </div>
</template>

<script lang="ts">
import { Collar, availableCollarProps, assignedCollarProps} from '../../../types/collar'
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { ActionGetPayload } from 'frontend/src/types/store';
import { getNotifyProps } from '../../notify';

export default Vue.extend({
  props: {
    title: String,
  },
  name: 'collars',
  computed: mapGetters(['assignedCollars', 'availableCollars', 'editObject']),
  data: function() {
    return {
      showEditModal: false,
      showRegisterModal: false,
      selected: {},
      assignedCollarProps: assignedCollarProps,
      availableCollarProps: availableCollarProps
    }
  },
  methods: {
    getHeader: (s: string) => Collar.getTitle(s),
    close() {
      this.showEditModal = false;
      this.showRegisterModal = false;
    },
    handleEditClick() {
      this.showEditModal = !this.showEditModal;
    },
    handleRegisterClick() {
      this.showRegisterModal = !this.showRegisterModal;
    },
    async save(collar: Collar) {
      this.$vs.notify({ title: `saving collar ID ${collar.device_id}`})
      const payload = {
        callback: cbCollarSaved,
        collar,
        type: collar.hasOwnProperty('animal_id') ? 'assignedCollars' : 'availableCollars'
      }
      this.$store.dispatch('upsertCollar', payload)
    },
    cBCollarsLoaded(body: any, err?: Error | string) {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
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
})

const cbCollarSaved = (payload) => {
  console.log(`add_collar success`);
}
</script>

<style scoped>
  h3 {
    margin-bottom: 10px;
  }
  button {
    padding: 3px 15px;
  }
</style>
