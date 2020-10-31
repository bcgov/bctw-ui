<template>
  <modal 
    class='grp-col'
    title="Add Animal"
    :active="active"
    :handleClose="handleClose"
  >
    <h3>General Information</h3><vs-divider></vs-divider>
    <div class="grp">
      <input-type label="Nickname"   propId="nickname"  v-model="addObject.nickname"></input-type>
      <input-type label="Animal ID*" propId="animal_id" v-model="addObject.animal_id"></input-type>
      <input-type label="WLHID*"     propId="wlh_id"    v-model="addObject.wlh_id"></input-type>
    </div>
    <h3>Group Management</h3><vs-divider></vs-divider>
    <div class="grp"> 
      <input-select header="species"         label="Species*"        v-on:change:select="addObject.species = $event"></input-select>
      <input-select header="region"          label="Region*"         v-on:change:select="addObject.region = $event"></input-select>
      <input-select header="population_unit" label="Population Unit" v-on:change:select="addObject.region = $event" autocomplete="true"></input-select>
    </div>
    <h3>Individual Characteristics</h3><vs-divider></vs-divider>
    <div class="grp">
      <!-- <input-select header="species" label="Species"></input-select> -->
      <input-check v-model="addObject.calf_at_heel" propId="calf_at_heel" label="Calf at heel?"></input-check>
    </div>
    <h3>Assigned GPS Collar</h3><vs-divider></vs-divider>
    <div class="grp">
    <vs-divider></vs-divider>
      <vs-button disabled >Assign Collar</vs-button>
    </div>
    <!-- fixme: -->
    <vs-button color="red" button="submit" @click="save" class="btn-save" type="border">Add Animal</vs-button>
    <!-- todo: display working version in modal -->
    <!-- <assign-collar></assign-collar> -->
  </modal>
</template>
<script lang="ts">
import { Animal } from '../../../types/animal';
import { mapGetters } from 'vuex';
import AssignCollar from './AssignCollar';
import Vue from 'vue';

Vue.component('assign-collar', AssignCollar);
export default {
  name: 'AddAnimal',
  props: {
    active: Boolean,
  },
  data() {
    return {
      animal_id: '',
      wlh_id: '',
      nickname: '',
      region: '',
      species: '',
      device_id: '',
      calf: false
    }
  },
  computed: {
    localComputed () {
    },
    ...mapGetters(["addObject"])
  },
  methods: {
    handleClose() {
      this.reset();
      this.$emit('update:modal')
    },
    save() {
      this.$emit('save:animal');
    },
    reset() {
      this.$store.commit('updateAddObject', {});
    }
  },
}
</script>

<style scoped>
.holamundo {
  display: flex;
  flex-direction: row;
}
.space {
  justify-content: space-between;
}
.grp-split {
  display: flex;
  flex-direction: row;
}
.grp-col {
  display: flex;
  flex-direction: column;
}
.grp {
  display: flex;
  flex-direction: row;
  margin: 15px 0px;
}
.btn-save {
  float:right;
}
h3 {
  margin: 5px 0px;
}
</style>