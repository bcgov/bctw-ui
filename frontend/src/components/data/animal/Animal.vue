<template>
  <div >
    <state-table
      v-model="animals"
      :getHeader="getHeader"
      :propsToDisplay="toDisplay"
      v-on:page:change="loadNewAnimals">
    </state-table>
    <br/>
    <vs-divider></vs-divider>
    <vs-button @click="() => handleEditClick(false)" type="border">Add Individual</vs-button>
    <vs-button @click="() => handleEditClick(true)" :disabled="Object.keys(editObject).length === 0" type="border">Edit Individual</vs-button>
    <add-animal
      :active="showAddModal"
      v-on:update:modal="handleEditClick"
      v-on:update:close="close"
      v-on:save:animal="save"
      :isEdit="isEditMode">
    </add-animal>
    <!-- <pre>{{selected}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DispatchOptions, mapGetters } from 'vuex';
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
      isEditMode: false,
      showAddModal: false,
      selected: {},
      toDisplay: ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id']
    }
  },
  methods: {
    close() {
      this.showAddModal = false
    },
    handleEditClick(isEdit: boolean) {
      this.isEditMode = isEdit;
      this.showAddModal = !this.showAddModal;
    },
    save() {
      console.log('Animal: an animal was saved!')
    },
    getHeader: (str: string) => Animal.getTitle(str),
    cbLoadCritters (data: any, err: Error) {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
    },
    loadNewAnimals(page: number = 1) {
      // console.log('Animal: new animals called: page', page);
      const payload = {
        page: page,
        callback: this.cbLoadCritters
      }
      this.$store.dispatch('getAnimals', payload);

    }
  },
  created() {
    this.$store.commit('updateEditObject', {});
  }
});
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

