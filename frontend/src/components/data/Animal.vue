
<template>
  <div >
    <vs-table
      :data="animals"
      v-model="selected"
      @selected="handleSelected"
    >
      <template slot="thead">
        <vs-th v-for="(value, propName) in animals[0]" :key="propName">
          {{propName}}
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
    <vs-button disabled type="border">Add Individual</vs-button>
    <vs-button @click="handleEditClick" :disabled="Object.keys(selected).length === 0" type="border">Edit Individual</vs-button>
      <!-- :editing="selected" -->
    <edit-modal 
      v-on:update:modal="handleEditClick" 
      v-on:update:save="save"
      :active="showEditModal"
      title="Edit Individual"
    ></edit-modal>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

export default {
  name: 'animals',
  computed: mapState(['animals']),
  props: {
    title: String,
  },
  data: function() {
    return {
      showEditModal: false,
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
    save(animal) {
      this.$vs.notify({ title: `saving individual with ID ${animal['Animal ID']}`})
      // console.log(`im saving!!! ${JSON.stringify(animal)}`)
      this.$store.commit('updateAnimals', animal);
    }
  },
  mounted() {
    this.$store.dispatch('requestAnimals', callback);
  }
}

const callback = () => {
  console.log('loading animals completed' )
}
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

