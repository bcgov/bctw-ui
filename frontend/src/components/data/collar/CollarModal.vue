<template>
  <modal
    :title="isEdit ? 'Edit Collar' : 'Add Collar'"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
    <div v-if="!isNewVHFCollar">
      <h4>Choose File to Parse Vectronics .keyx</h4>
      <div class="grp">
        <keyx-modal v-on:keyx:parsed="handleParse"></keyx-modal>
      </div>
    </div>

    <div class="grp">
      <vs-input label="Device ID*" :disabled="!isNewVHFCollar" v-model="collar.device_id"></vs-input>
      <input-select header="collar_make" label="Collar Make*" v-on:change:select="handleSelect" :val="collar.make"></input-select>
      <vs-input label="Collar Model" v-model="collar.model"></vs-input>
    </div>
    <div class="grp">
      <input-select header="satellite_network" label="GPS Vendor" v-on:change:select="handleSelect" :val="collar.satellite_network"></input-select>
      <input-select header="collar_type" label="Collar Type*" v-on:change:select="handleSelect" :val="collar.collar_type"></input-select>
      <vs-input type="number" label="Radio Frequency" v-model="collar.radio_frequency"></vs-input>
    </div>
    <vs-button
      button="submit"
      @click="save"
      class="btn-save"
      type="border"
      :disabled="!canSave"
    >Save</vs-button>
  </modal>
</template>
  
<script lang="ts">
import { ActionPayload, mapGetters } from 'vuex';
import { Collar, encodeCollar, NewCollarType } from '../../../types/collar';
import Vue from 'vue';
import { ActionPostPayload } from 'frontend/src/types/store';
import { getNotifyProps } from '../../notify';
import { canSaveObject } from '../../component_helpers';

export default Vue.extend({
  name: 'CollarModal',
  props: {
    title: { type: String, required: false },
    active: { type: Boolean, required: true },
    getHeader: Function,
    isEdit: { type: Boolean, required: false, default: false }
  },
  data() {
    return {
      collar: {} as Collar,
      requiredFields: ['device_id', 'make', /*'collar_status'*/],
      canSave: false as boolean,
    }
  },
  computed: {
    isNewVHFCollar(): boolean {
      return this.newCollarType === NewCollarType.VHF && !this.isEdit;
    },
    ...mapGetters(['editObject', 'newCollarType'])
  },
  methods: {
    save() {
      const body = encodeCollar(this.collar);
      const payload: ActionPostPayload = {
        body,
        callback: (data: Collar, err?: Error | string): void => {
          if (err) {
            this.$vs.notify(getNotifyProps(err, true));
          } else {
            const collar = data[0];
            this.$vs.notify(getNotifyProps(`collar ${collar.device_id} saved`));
          }
        }
      }
      this.$store.dispatch('upsertCollar', payload);
      this.$emit('save:collar');
    },
    handleSelect(keyVal: any) {
      // fixme: discrepency between code header name and collar column :[
      if (keyVal['collar_make']) {
        keyVal = {make: keyVal['collar_make']}
      }
      this.collar = Object.assign({}, this.collar, keyVal)
    },
    handleParse(o: any) {
      this.collar = Object.assign({}, this.collar, o);
    },
    reset() {
      this.collar = {} as Collar;
    }
  },
  watch: {
    collar() {
      this.canSave = canSaveObject(this.requiredFields, this.collar);
    },
    active(show) {
      if (show && this.isEdit) {
        this.collar = this.editObject;
      }
      if (!show) {
        this.reset();
      }

    }
  }
})
</script>

<style>
.grp {
  display: flex;
  flex-direction: row;
  margin: 15px 0px;
}
.btn-save {
  float:right;
}
.inRow {
  display: flex;
  flex-direction: row;
  /* flex-grow: 1; */
  flex-wrap: wrap;
}
.editinput {
  width: calc(100% * (2/3) );
}
</style>