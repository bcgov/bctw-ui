<template>
  <modal
    :title="title"
    :active="active"
    :handleClose="handleClose"
  >
    <div v-if="editObject" class="inRow">
      <div v-for="(val, prop) in editObject" :key="prop">
        <!-- <p>{{prop}}:{{val}} -->
        <input-type 
          :label="formatHeader(prop)" 
          v-model="editObject[prop]"
          :propId="prop"
          :initialValue="editObject[prop]"
          :isDisabled="flagDisabled(prop)"
          v-on:update:model="handleInputChange"
        />
        <!-- :isVisible=shouldShow todo: confirm its ok to remove this from input-type? -->
      </div>
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
  
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'EditModal',
  props: {
    title: String,
    active: Boolean,
    formatHeader: Function
  },
  data() {
    return {
      cannotEdit: ['device_id', 'max_transmission_date', 'interval', 'animal_id'],
      canSave: false,
      changedValues: {},
      // editing: this.$store.getters.editObject
    }
  },
  computed: {
    ...mapGetters(["editObject"])
  },
  methods: {
    // disable editing on these fields
    flagDisabled(v) {
      return this.cannotEdit.indexOf(v) === -1 ? false : true;
    },
    save() {
      this.shouldShow = false;
      const newObj = { ...this.$store.getters.editObject, ...this.changedValues }
      this.$emit('update:save', newObj)
    },
    handleInputChange(e) {
      this.changedValues = {...this.changedValues, ...e}
      this.canSave = true;
    },
    handleClose() {
      // bubble this event to parent component
      // as changing the prop itself "active" is bad
      this.$emit('update:modal')
      this.canSave = false;
    },
  },
}
</script>

<style>
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