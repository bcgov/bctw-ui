<template>
  <div >
    <state-table title="" v-model="animals"></state-table><br/>
    <vs-button @click="handleAddClick" type="border">Add Individual</vs-button>
    <vs-button @click="handleEditClick" :disabled="Object.keys(editObject).length === 0" type="border">Edit Individual</vs-button>
    <edit-modal 
      :active="showEditModal"
      :formatHeader="toHeader"
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
import AddAnimal from './AddAnimal'
import { mapGetters, mapState } from 'vuex';
import { animalPropToDisplay } from '../../../types/animal'

Vue.component('add-animal', AddAnimal);

export default {
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
    }
  },
  methods: {
    handleEditClick(v) {
      this.showEditModal = !this.showEditModal;
    },
    handleAddClick(v) {
      this.showAddModal = !this.showAddModal;
    },
    save(animal) {
      console.log('im saving an animal!');
      return;
      this.$vs.notify({ title: `saving animal ID ${animal.animal_id}`})
      const payload = {
        callback: cbAnimalSaved,
        animal
      }
      this.$store.dispatch('upsertAnimal', payload)
    },
    toHeader(str) {
      return animalPropToDisplay(str);
    }
  },
  created() {
    this.$store.commit('editObject', {});
    if (!this.animals?.length) {
      this.$store.dispatch('getAnimals', callback);
    }
  }
}

const cbAnimalSaved = () => {
  console.log('add_animal success')
}

const callback = (body) => {
  console.log(`loaded ${body.length} animals` )
}
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

