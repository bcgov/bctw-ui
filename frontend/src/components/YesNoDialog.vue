<template>
  <modal
    :title="title"
    :active="active"
    :handleClose="noHandler"
  >
  <div>
    {{msg}}
  </div>
  <vs-button @click="yesHandler">Yes</vs-button>
  <vs-button @click="noHandler">No</vs-button>
</modal>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'YesNoDialog',
  props: {
    active: {
      type: Boolean,
      default: false,
      required: true
    },
    msg: String,
    title:String,
  },
  data: function() {
    return {
    }
  },
  methods: {
    yesHandler() {
      this.$emit('clicked:yes');
    },
    noHandler() {
      this.$emit('update:yesno')
    },
  },
})
</script>