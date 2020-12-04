<template>
  <modal
    title="Add New Code Type"
    :active="active"
    v-on:update:modal="$emit('update:close')">
    <div class="grp">
      <input-type label="Name" propId="code_header_name" v-model="header_name" v-on:input="canSave" ></input-type>
      <input-type label="Title" propId="code_header_title" v-model="header_title" v-on:input="canSave"></input-type>
      <input-type label="Description" propId="code_header_description" v-model="header_description" v-on:input="canSave"></input-type>
    </div>
    <vs-button button="submit" @click="save" class="btn-save" type="border" :disabled="!saveable" >Save</vs-button>
  </modal>
</template>

<script lang="ts">
import { getNotifyProps} from '../../notify';
import Vue from 'vue';
import { ActionPostPayload } from 'frontend/src/types/store';
export default Vue.extend({
  name: 'AddCodeHeader',
  props: {
    active: Boolean
  },
  data() {
    return {
      header_name: '',
      header_title: '',
      header_description: '',
      saveable: false
    }
  },
  methods: {
    canSave() {
      this.saveable = !!(this.header_name && this.header_title && this.header_description);
    },
    save() {
      const body = {
        code_header_name: this.header_name,
        code_header_title: this.header_title,
        code_header_description: this.header_description
      };
      const payload:ActionPostPayload = { body, callback: this.callback };
      this.$store.dispatch('upsertCodeHeader', payload);
      // this.handleClose();
    },
    reset() {
      this.header_name = '';
      this.header_title = '';
      this.header_description = '';
    },
    callback(data: any, err?: Error | string) {
      let msg; 
      if (err) {
        msg = `error adding code header ${err}`;
      } else {
        const item = data && data[0] && data[0].code_header_name;
        msg = `added code type ${item}`;
      }
      this.$vs.notify(getNotifyProps(msg, !!err))
    }
  }
})
</script>

<style scoped>
  .grp {
    display: flex;
    flex-direction: row;
  }
  .btn-save {
    float:right;
  }
</style>