<template>
<!-- todo:
  - add limit option to backend query to only request page max size
  - make inputs type specific
-->
  <div>
    <state-table v-if="availableCollars" title="Available Collars" v-model="availableCollars" :getHeader="getHeader" :propsToDisplay="toDisplay"></state-table>
    <state-table v-if="assignedCollars" title="Assigned Collars" v-model="assignedCollars" :getHeader="getHeader" :propsToDisplay="toDisplay"></state-table>
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

<script>
import { Collar, collarPropsToDisplay } from '../../../types/collar'
import Vue from 'vue';
import { mapGetters } from 'vuex';
import RegisterCollarModal from './RegisterCollar';

Vue.component('register-modal', RegisterCollarModal);

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
      toDisplay: collarPropsToDisplay
    }
  },
  methods: {
    getHeader: (s) => Collar.getTitle(s),
    close() {
      this.showEditModal = false;
      this.showRegisterModal = false;
    },
    handleEditClick(v) {
      this.showEditModal = !this.showEditModal;
    },
    handleRegisterClick(v) {
      this.showRegisterModal = !this.showRegisterModal;
    },
    async save(collar) {
      this.$vs.notify({ title: `saving collar ID ${collar.device_id}`})
      const payload = {
        callback: cbCollarSaved,
        collar,
        type: collar.hasOwnProperty('animal_id') ? 'assignedCollars' : 'availableCollars'
      }
      this.$store.dispatch('upsertCollar', payload)
    },
  },
  mounted() {
    this.$store.dispatch('requestCollars', callback);
  }
})

const callback = () => {
  console.log('loading collars completed' )
}

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
