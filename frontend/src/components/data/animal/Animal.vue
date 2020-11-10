<template>
  <div >
    <state-table
      title="Animals with Collars"
      v-model="assignedAnimals"
      :getHeader="getHeader"
      :propsToDisplay="toDisplay"
      v-on:page:change="(p) => loadNewAnimals(p, 1)">
    </state-table><br/>
    <state-table
      title="Animals without Collars"
      v-model="unassignedAnimals"
      :getHeader="getHeader"
      :propsToDisplay="toDisplay"
      v-on:page:change="(p) => loadNewAnimals(p, 0)">
    </state-table><br/>
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
    <!-- <pre>{{editObject}}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { ActionCallback, ActionGetPayload, ActionPostPayload } from '../../../types/store';
import { Animal } from '../../../types/animal'
import { getNotifyProps } from '../../notify';

export default Vue.extend({
  name: 'animals',
  computed: mapGetters(['assignedAnimals', 'unassignedAnimals', 'editObject']),
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
      // console.log('Animal: an animal was saved!')
    },
    getHeader: (str: string) => Animal.getTitle(str),
    cbLoadCritters: (body: any, err?: Error | string): void => {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
    },
    loadNewAnimals(page: number = 1, isAssign: number) {
      const payload: ActionGetPayload = {
        callback: this.cbLoadCritters,
        page,
      }
      if (isAssign) {
        this.$store.dispatch('getAssignedAnimals', payload);
      } else {
        this.$store.dispatch('getUnassignedAnimals', payload);
      }
    }
  },
  mounted() {
    // this.$store.dispatch('getAnimals', {callback: this.cbLoadCritters});
  }
});
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

