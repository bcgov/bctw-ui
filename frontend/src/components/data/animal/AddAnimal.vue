<template>
<!-- todo: can only save existing critter when value has changed -->
  <modal 
    class='grp-col'
    :title="isEdit ? 'Edit Animal' : 'Add Animal'"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
    <h3>General Information</h3><vs-divider></vs-divider>
    <div class="grp">
      <vs-input label="Nickname" class="inputx" v-model="animal.nickname"></vs-input>
      <vs-input label="Animal ID*" class="inputx" v-model="animal.animal_id"></vs-input>
      <vs-input label="WLHID*" class="inputx" v-model="animal.wlh_id"></vs-input>
    </div>

    <h3>Group Management</h3><vs-divider></vs-divider>
    <div class="grp"> 
      <input-select header="species"         label="Species*"        v-on:change:select="handleSelect" :val="animal.species"></input-select>
      <input-select header="region"          label="Region*"         v-on:change:select="handleSelect" :val="animal.region"></input-select>
      <input-select header="population_unit" label="Population Unit" v-on:change:select="handleSelect" :val="animal.population_unit" autocomplete="true"></input-select>
    </div>

    <h3>Individual Characteristics</h3><vs-divider></vs-divider>
    <div class="grp">
      <input-check v-model="animal.calf_at_heel" propId="calf_at_heel" label="Calf at heel?"></input-check>
    </div>

    <div>
      <h3>Assigned GPS Collar</h3><vs-divider></vs-divider>
      <state-table v-if="assignment.length" :propsToDisplay="toDisplay" :getHeader="(s) => s" v-model="assignment"></state-table>
      <div v-else-if="isEdit && hasCollarAssigned"><p>device assigned: {{animal.device_id}}</p></div>
      <br/><vs-divider></vs-divider>
    </div>

    <vs-button 
      :disabled="isEdit && hasCollarAssigned ? false : canAssignCollar ? false : true"
      type="filled"
      @click="handleCollarClick">
        {{`${hasCollarAssigned ? 'Unassign' : 'Assign'} Collar`}}</vs-button>
    <vs-button 
      :disabled="!canSave"
      button="submit"
      @click="save"
      class="btn-save"
      type="border">
      Save Animal</vs-button>

    <assign-collar 
      :active="bShowAssignModal"
      :critter="animal"
      v-on:update:close="showAssign"
      v-on:collar:assigned="handleAssignment"
    ></assign-collar>
    <yes-no msg="Are you sure you want to unassign this collar?"
      title="Confirm Unassignment"
      :active="bShowYesNoModal"
      v-on:update:yesno="showYesNo"
      v-on:clicked:yes="unassignCollar"
    ></yes-no>
    <!-- <pre>{{assignment}}</pre> -->
  </modal>
</template>
<script lang="ts">
import { Animal } from '../../../types/animal';
import { mapGetters } from 'vuex';
import Vue from 'vue';
import { getNotifyProps } from '../../notify';
import { ICollar, ICollarLinkResult } from '../../../types/collar';

import { formattedNow } from '../../../api/api_helpers';

export default Vue.extend({
  name: 'AddAnimal',
  props: {
    active: { type: Boolean, required: true },
    isEdit: { type: Boolean, required: false, default: false }
  },
  data() {
    return {
      animal: {} as Animal,
      assignment: [] as ICollarLinkResult[], // an array so data can be display in state-table component
      canAssignCollar: false as boolean,
      canSave: false as boolean,
      bShowAssignModal: false as boolean,
      bShowYesNoModal: false as boolean,
      requiredFields: ['animal_id', 'wlh_id', 'region', 'species'] as string[],
      toDisplay: ['animal_id', 'device_id', 'effective_date', 'end_date']
    }
  },
  computed: {
    hasCollarAssigned() {
      return !!this.animal.device_id;
    },
    ...mapGetters(["editObject"])
  },
  methods: {
    handleCollarClick() {
      this.hasCollarAssigned ? this.showYesNo() : this.showAssign();
    },
    handleSelect(keyVal: any) {
      this.animal = Object.assign({}, this.animal, keyVal)
    },
    close() {
      this.bShowAssignModal = false;
      this.bShowYesNoModal = false;
    },
    showAssign() {
      this.bShowAssignModal = !this.bShowAssignModal;
    },
    showYesNo() {
      this.bShowYesNoModal= !this.bShowYesNoModal;
    },
    unassignCollar() {
      const cb = (data: ICollarLinkResult, err?: Error | string) => {
        console.log(`results of unassign: ${JSON.stringify(data)}`);
        if (err) {
          this.$vs.notify(getNotifyProps(err, true));
        } else {
          this.$vs.notify(getNotifyProps(`collar ${data.device_id} successfully unassigned from ${data.animal_id}`));
          this.close();
          this.assignment.pop();
          this.animal.device_id = null;
          this.canAssignCollar = true;
        }
      }
      const payload = {
        body: {
          link: false,
          data: {
            animal_id: this.animal.id,
            device_id: +this.animal.device_id,
            end_date: formattedNow(),
          },
        },
        callback: cb
      }
      this.$store.dispatch('linkOrUnlinkCritterCollar', payload);
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
      this.animal = {} as Animal;
      this.assignment = [];
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
      this.showAssign(); // close the collar modal
      console.log('AddAnimal: collar assigned')
      this.assignment.push(data);
    }
  },
  watch: {
    // todo: handle required fields better?
    animal() {
      let r = true;
      this.requiredFields.forEach((field) => {
        if (!this.animal[field]) {
          r = false;
        }
      });
      this.canSave = r;
    },
    active(show) {
      if (show && this.isEdit) {
        this.animal = this.editObject;
      }
      if (!show) {
        this.reset();
      }
    },
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