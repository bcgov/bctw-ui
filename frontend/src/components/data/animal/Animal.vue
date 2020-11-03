<template>
  <div >
    <state-table
      v-model="animals"
      :getHeader="getHeader"
      :propsToDisplay="toDisplay">
    </state-table>
    <br/>
    <vs-divider></vs-divider>
    <vs-button @click="handleAddClick" type="border">Add Individual</vs-button>
    <vs-button @click="handleEditClick" :disabled="Object.keys(editObject).length === 0" type="border">Edit Individual</vs-button>
    <edit-modal 
      :active="showEditModal"
      :formatHeader="getHeader"
      title="Edit Individual"
      v-on:update:modal="handleEditClick" 
      v-on:update:save="save">
    </edit-modal>
    <add-animal
      :active="showAddModal"
      v-on:update:modal="handleAddClick"
      v-on:save:animal="save">
    </add-animal>
    <!-- <pre>{{selected}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { Animal } from '../../../types/animal'
import { getNotifyProps } from '../../notify';

export default Vue.extend({
  name: 'animals',
  computed: {
    ...mapGetters(['animals','editObject'])
  },
  props: {
    title: String,
  },
  data: function() {
    return {
      showEditModal: false,
      showAddModal: false,
      selected: {},
      toDisplay: ['nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id']
    }
  },
  methods: {
    handleEditClick() {
      this.showEditModal = !this.showEditModal;
    },
    handleAddClick() {
      this.showAddModal = !this.showAddModal;
    },
    save() {
      console.log('Animal: an animal was saved!')
      // this.$store.dispatch('upsertAnimal', payload);
    },
    getHeader: (str: string) => Animal.getTitle(str),
    callback (data: any, err: Error) {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
    }
  },
  created() {
    this.$store.commit('updateEditObject', {});
    if (!this.animals?.length) {
      this.$store.dispatch('getAnimals', this.callback);
    }
  }
});
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

