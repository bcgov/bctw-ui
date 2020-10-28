<template>
  <div >
    <vs-table
      v-if="animals"
      :data="animals"
      v-model="selected"
      @selected="handleSelected"
    >
      <template slot="thead">
        <vs-th v-for="(value, prop) in animals[0]" :key="prop">
          {{toHeader(prop)}}
        </vs-th>
      </template>
      <template slot-scope="{data}">
        <vs-tr :key="index" v-for="(animal, index) in animals" :data="animal" >
          <vs-td :key="v" v-for="(k, v) in animal" :data="k">
            {{k}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <!-- <pre>{{selected}}</pre> -->
    <br/>
    <vs-button @click="handleAddClick" type="border">Add Individual</vs-button>
    <vs-button @click="handleEditClick" :disabled="Object.keys(selected).length === 0" type="border">Edit Individual</vs-button>
      <!-- :editing="selected" -->
    <edit-modal 
      v-on:update:modal="handleEditClick" 
      v-on:update:save="save"
      :active="showEditModal"
      title="Edit Individual"
      :formatHeader="toHeader"
    >
    <!-- testing slots -->
    <!-- <p> hey there </p> -->
    </edit-modal>
    <add-animal
      :active="showAddModal"
      v-on:update:modal="handleAddClick"
    ></add-animal>
    <!-- <pre>{{selected}}</pre> -->
  </div>
</template>

<script>
import Vue from 'vue';
import AddAnimal from './AddAnimal'
import { mapState } from 'vuex';
import { animalPropToDisplay } from '../../types/animal'

Vue.component('add-animal', AddAnimal);

export default {
  name: 'animals',
  computed: {
    animals () {
      return this.$store.state.rootModule.animals
    }
  },
  props: {
    title: String,
  },
  data: function() {
    return {
      showEditModal: false,
      showAddModal: false,
      selected: {}
    }
  },
  methods: {
    handleSelected(tr) {
      this.$store.commit('updateEditingObject', tr);
    },
    handleEditClick(v) {
      this.showEditModal = !this.showEditModal;
    },
    handleAddClick(v) {
      this.showAddModal = !this.showAddModal;
    },
    save(animal) {
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
  mounted() {
    this.$store.dispatch('requestAnimals', callback);
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

