<template>
  <modal
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
  <div>
    {{msg}}
  </div>
  <vs-button @click="yesHandler">Yes</vs-button>
  <vs-button @click="$emit('update:close')">No</vs-button>
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
  },
})
</script>