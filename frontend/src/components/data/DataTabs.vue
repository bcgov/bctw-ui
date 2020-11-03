<template>
<!--
  todo:
  - move tabs to left side of page stacked vertically
-->
  <div class="ss">
    <vs-tabs>
      <vs-tab
        v-for="item in items"
        :key="item.key"
        :label="item.title"
        :disabled="item.disabled"
      >
        <div class="con-tab-ejemplo">
          <component :is="item.component"></component>
        </div>
      </vs-tab>
    </vs-tabs>
  </div>
</template>

<script>
import AddAnimal from './animal/AddAnimal';
import AddCodeHeader from './codes/AddCodeHeader';
import AssignCollar from './animal/AssignCollar';
import Collar from './collar/Collar';
import Animal from './animal/Animal';
import Settings from './Settings';
import Input from '../form/Input';
import Checkbox from '../form/Checkbox';
import Select from '../form/Select';
import FileInput from '../form/FileInput';
import Modal from '../Modal';
import EditModal from '../data/EditModal'
import StateTable from '../Table';
import Vue from 'vue';

Vue.component('add-animal', AddAnimal, );
Vue.component('add-code', AddCodeHeader);
Vue.component('assign-collar', AssignCollar);
Vue.component('edit-modal', EditModal);
Vue.component('file-input', FileInput);
Vue.component('input-check', Checkbox);
Vue.component('input-type', Input);
Vue.component('input-select', Select);
Vue.component('state-table', StateTable);
Vue.component('modal', Modal);

export default {
  name: 'dataTabs',
  data: function() {
    return { }
  },
  computed: {
    items() {
      return [
        { title: 'Settings', disabled: false, key: 2, component: Settings },
        { title: 'Critters', disabled: false, key: 0, component: Animal },
        { title: 'Collars', disabled: false, key: 1, component: Collar },
        { title: 'Profile', disabled: true, key: 3 }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
#ss
  position absolute 
  width 100%
  height 100%
</style>

