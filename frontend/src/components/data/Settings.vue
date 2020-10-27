<template>
  <div>
    <!-- <p>welcome to settings page</p> -->
    <file-input name="csv">
  </div>
</template>

<script>
import Vue from 'vue';
import FileInput from '../form/FileInput';

Vue.component('file-input', FileInput);

export default {
  name: 'Settings',
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>