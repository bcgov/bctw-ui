<template>
<!-- todo:
  - convert this to use state-table
  - add limit option to backend query to only request page max size
  - make inputs type specific
-->
  <div v-if="collars">
    <!-- iterate the collars object  -->
    <div v-for="(value, propertyName) in collars" :key="propertyName">
      <vs-table
        :data="value"
        v-model="selected"
        @selected="handleSelected"
      >
      <template slot="header">
        <h3>{{propertyName === 'availableCollars' ? 'Available Collars' : 'Assigned Collars'}}</h3>
      </template>

      <!-- iterate the properties of the first collar 
      in each collar type to get the table headers -->
      <template slot="thead">
        <vs-th v-for="(v, p) in value[0]" :key="p">
          {{toHeader(p)}}
        </vs-th>
      </template>

      <!-- iterate each collar types collars to display the data -->
      <template slot-scope="{data}">
        <vs-tr :key="index" v-for="(collar, index) in value" :data="collar" >
          <vs-td :key="v" v-for="(k, v) in collar" :data="k">
            {{k}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <br/>
    </div> <!-- end iterate properties of $store.collars -->
    <div>
      <vs-button type="border" @click="handleRegisterClick">Register New Collar</vs-button>
      <vs-button disabled type="border">Retire Collar</vs-button>
      <vs-button :disabled="Object.keys(selected).length === 0" @click="handleEditClick" type="border">See Collar Details</vs-button>
    </div>
    <edit-modal 
      v-on:update:modal="handleEditClick" 
      v-on:update:save="save"
      :active="showEditModal"
      title="Edit Collar"
      :editing="selected"
      :formatHeader="toHeader"
    ></edit-modal>
    <register-modal 
      v-on:update:modal="handleRegisterClick" 
      :active="showRegisterModal"
      title="Register A New Vectronics Collar"
    ></register-modal>
    <!-- <pre>{{selected}}</pre> -->
  </div>
</template>

<script>
import { collarPropToDisplay } from '../../../types/collar'
import Vue from 'vue';
import { mapState } from 'vuex';
import RegisterCollarModal from './RegisterCollar';

Vue.component('register-modal', RegisterCollarModal);

export default {
  props: {
    title: String,
  },
  name: 'collars',
  computed: {
    collars () {
      return this.$store.state.rootModule.collars
    }
  },
  data: function() {
    return {
      showEditModal: false,
      showRegisterModal: false,
      selected: {},
    }
  },
  methods: {
    handleSelected(tr) {
      this.$store.commit('updateEditingObject', tr);
      // this.$vs.notify({ title: `device ${tr['Device ID']} selected` })
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
    toHeader(str) {
      return collarPropToDisplay(str);
    }
  },
  mounted() {
    this.$store.dispatch('requestCollars', callback);
  }
}

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
