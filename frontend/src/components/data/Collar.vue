<template>
  <div >
    <!-- iterate the collars object  -->
    <div v-for="(value, propertyName) in collars" :key="propertyName">
      <vs-table
        pagination
        :data="value"
        v-model="selected"
        @selected="handleSelected"
      >
      <template slot="header">
        <h3>{{propertyName === 'availableCollars' ? 'Available Collars' : 'Assignable Collars'}}</h3>
      </template>

      <!-- iterate the properties of the first collar 
      in each collar type to get the table headers -->
      <template slot="thead">
        <vs-th v-for="(v, p) in value[0]" :key="p">
          {{p}}
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
      <vs-button type="border">Register New Collar</vs-button>
      <vs-button type="border">Retire Collar</vs-button>
      <vs-button @click="handleEditClick" type="border">See Collar Details</vs-button>
    </div>
    <edit-modal 
      v-on:update:modal="handleEditClick" 
      :active="showEditModal">
    </edit-modal>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import EditModal from './EditModal';

Vue.component('edit-modal', EditModal);

export default {
  props: {
    title: String,
  },
  name: 'collars',
  computed: mapState(['collars']),
  data: function() {
    return {
      showEditModal: false,
      showAddModal: false,
      selected: [],
    }
  },
  methods: {
    handleSelected(tr) {
      this.$vs.notify({ title: `device ${tr['Device ID']} selected` })
    },
    handleEditClick() {
      this.showEditModal = !this.showEditModal;
    }
  },
  mounted() {
    this.$store.dispatch('requestCollars', callback);
  }
}

const callback = () => {
  console.log('loading collars completed' )
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

