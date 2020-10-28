<template>
  <modal
    title="Add Code Header"
    :active="active"
    :handleClose="handleClose"
  >
    <input-type label="Name" propId="header_name" :val="header_name"></input-type>
    <input-type label="Title" propId="header_title" :val="header_title"></input-type>
    <input-type label="Name" propId="header_description" :val="header_description"></input-type>

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
export default {
  name: 'AddCodeHeader',
  props: {
    active: Boolean
  },
  data() {
    return {
      header_name: '',
      header_title: '',
      header_description: '',
      canSave: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:modal');
    },
    save() {
      const header = {header_name, header_title, header_description};
      this.$store.dispatch('upsertCodeHeader', header);
    }
  }
}
</script>

<style scoped>
  .btn-save {
    float:right;
  }
</style>