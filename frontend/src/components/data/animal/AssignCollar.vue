<template>
  <modal
    :title="title"
    :active="active"
    :handleClose="handleClose"
  >
  <div v-if="collars">
    <state-table :getHeader="getHeader" v-model="collars" :propsToDisplay="toDisplay"></state-table><br/>
    <vs-button type="filled" @click="saveCollar">Assign Collar</vs-button>
    <!-- <pre>{{selected}}</pre> -->
    <!-- <pre>{{critter}}</pre> -->
  </div>
  <div v-else><p>Collar data not available</p></div>
</modal>
</template>

<script lang="ts">
// todo: date picker for collar assignment duration
import { Animal } from 'frontend/src/types/animal';
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import { getNotifyProps } from '../../notify';
import { Collar, ICollarLinkResult, collarPropsToDisplay } from '../../../types/collar';

export default Vue.extend({
  name: 'AssignCollar',
  props: {
    active: {
      type: Boolean,
      default: false,
      required: true
    },
    critter: {
      required: true,
    } 
  },
  data: function() {
    return {
      toDisplay: collarPropsToDisplay
    }
  },
  computed: {
    title() {
      return `Assign collar to critter ${(this.critter as Animal)?.animal_id ?? ''}`;
    },
    ...mapGetters({ 
      collars: 'availableCollars',
      selected: 'editObject',
    }),
  },
  methods: {
    getHeader: (s:string) => Collar.getTitle(s),
    saveCollar() {
      const payload = {
        body: {
          link: true,
          data: {
            animal_id: (this.critter as Animal).animal_id,
            device_id: +this.selected.device_id,
            start_date: Date.now(),
          },
        },
        callback: this.cbAssignCollar
      };
      this.$store.dispatch('linkOrUnlinkCritterCollar', payload);
    },
    handleClose() {
      this.$emit('update:innerModal')
    },
    cbAssignCollar(data: ICollarLinkResult, err?: Error | string) {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      } else {
        console.log(`result of collar link: ${JSON.stringify(data)}`);
        this.$vs.notify(getNotifyProps(`collar assigned to ${data.animal_id}!`));
        // emit to parent
        this.$emit('collar:assigned', data);
      }
    }
  },
  mounted() {
    if (!this.collars.length) {
      console.log('AssignCollar: requesting collars')
      this.$store.dispatch('getAvailableCollars', () => console.log('done loading collars'));
    }
  }
})
</script>