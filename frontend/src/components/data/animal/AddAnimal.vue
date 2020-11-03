<template>
  <modal 
    class='grp-col'
    title="Add Animal"
    :active="active"
    :handleClose="handleClose"
  >
    <h3>General Information</h3><vs-divider></vs-divider>
    <div class="grp">
      <input-type label="Nickname"   propId="nickname"  v-model="animal.nickname"></input-type>
      <input-type label="Animal ID*" propId="animal_id" v-model="animal.animal_id"></input-type>
      <input-type label="WLHID*"     propId="wlh_id"    v-model="animal.wlh_id"></input-type>
    </div>

    <h3>Group Management</h3><vs-divider></vs-divider>
    <div class="grp"> 
      <input-select header="species"         label="Species*"        v-on:change:select="handleSelect"></input-select>
      <input-select header="region"          label="Region*"         v-on:change:select="handleSelect"></input-select>
      <input-select header="population_unit" label="Population Unit" v-on:change:select="handleSelect" autocomplete="true"></input-select>
    </div>

    <h3>Individual Characteristics</h3><vs-divider></vs-divider>
    <div class="grp">
      <input-check v-model="animal.calf_at_heel" propId="calf_at_heel" label="Calf at heel?"></input-check>
    </div>

    <div>
      <h3>Assigned GPS Collar</h3><vs-divider></vs-divider>
      <state-table v-if="assignment" :propsToDisplay="toDisplay" :getHeader="(s) => s" v-model="assignment"></state-table>
      <br/><vs-divider></vs-divider>
    </div>
    <!-- <div class="grp"> -->
      <vs-button :disabled="!canAssignCollar" type="filled" @click="showAssignModal">Assign Collar</vs-button>
    <!-- </div> -->

    <vs-button :disabled="!canSave" button="submit" @click="save" class="btn-save" type="border">Save Animal</vs-button>
    <assign-collar 
      :active="showAssignCollarModal"
      :critter="animal"
      v-on:update:innerModal="showAssignModal"
      v-on:collar:assigned="handleAssignment"
    ></assign-collar>
    <pre>{{assignment}}</pre>
  </modal>
</template>
<script lang="ts">
import { Animal } from '../../../types/animal';
import { mapGetters } from 'vuex';
import Vue from 'vue';
import { getNotifyProps } from '../../notify';
import { ICollarLinkResult } from 'frontend/src/types/collar';

export default Vue.extend({
  name: 'AddAnimal',
  props: {
    active: Boolean,
  },
  data() {
    return {
      animal: {} as Animal,
      canAssignCollar: true as boolean,
      canSave: false as boolean,
      requiredFields: ['animal_id', 'wlh_id', 'region', 'species'] as string[],
      showAssignCollarModal: false as boolean,
      assignment: [] as ICollarLinkResult[], // make it array so can display in state-table component
      toDisplay: ['animal_id', 'device_id', 'effective_date', 'end_date']
    }
  },
  computed: {
    // ...mapGetters(["editObject"])
  },
  methods: {
    handleSelect(keyVal: any) {
      this.animal = Object.assign({}, this.animal, keyVal)
    },
    showAssignModal() {
      this.showAssignCollarModal = !this.showAssignCollarModal;
    },
    handleClose() {
      this.reset();
      this.$emit('update:modal') //parent handler to close modal
    },
    save() {
      const payload = {
        body: this.animal,
        callback: this.cbSaveNewCritter,
      }
      this.$store.dispatch('upsertAnimal', payload);
      this.$emit('save:animal');
    },
    reset() {
      // this.$store.commit('updateEditObject', {});
      this.canAssignCollar = false;
    },
    cbSaveNewCritter(data: Animal[], err: Error) {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      } else {
        this.$vs.notify(getNotifyProps(`critter ${data[0].animal_id} saved`));
        this.canAssignCollar = true;
      }
    },
    handleAssignment(data: ICollarLinkResult) {
      this.showAssignModal(); // close the collar modal
      console.log('AddAnimal: collar assigned')
      this.assignment.push(data);
    }
  },
  watch: {
    animal() {
      let r = true;
      this.requiredFields.forEach((field) => {
        if (!this.animal[field]) {
          r = false;
        }
      });
      this.canSave = r;
    }
  },
});
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