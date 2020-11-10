<template>
  <modal
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
  <div v-if="collars">
    <state-table
      :getHeader="getHeader"
      v-model="collars"
      :propsToDisplay="toDisplay"
      v-on:page:change="loadNewCollars"
    ></state-table><br/>
    <vs-button type="filled" @click="saveCollar">Assign Collar</vs-button>
    <!-- <pre>{{selected}}</pre> -->
    <!-- <pre>{{critter}}</pre> -->
  </div>
  <div v-else><p>Collar data not available</p></div>
</modal>
</template>

<script lang="ts">
// todo: date picker for collar assignment duration
import { Animal } from '../../../types/animal';
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import { getNotifyProps } from '../../notify';
import { Collar, ICollarLinkResult, availableCollarProps} from '../../../types/collar';
import { formattedNow } from '../../../api/api_helpers';
import { ActionGetPayload, ActionPostPayload } from 'frontend/src/types/store';

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
  data() {
    return {
      toDisplay: availableCollarProps
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
      const cb = (data: ICollarLinkResult, err?: Error | string) => {
        if (err) {
          this.$vs.notify(getNotifyProps(err, true));
        } else {
          console.log(`result of collar link: ${JSON.stringify(data)}`);
          this.$vs.notify(getNotifyProps(`collar assigned to ${data.animal_id}!`));
          // emit to parent
          this.$emit('collar:assigned', data);
        }
      }
      const payload: ActionPostPayload = {
        body: {
          link: true,
          data: {
            animal_id: +this.critter.id,
            device_id: +this.selected.device_id,
            start_date: formattedNow(),
          },
        },
        callback: cb
      };
      this.$store.dispatch('linkOrUnlinkCritterCollar', payload);
    },
    cbLoadCollars: (body: any, err?: Error | string): void => {
      if (err) {
        this.$vs.notify(getNotifyProps(err, true));
      }
    },
    loadNewCollars(page: number = 1) {
      const payload: ActionGetPayload = {
        callback: this.cbLoadCollars,
        page
      }
      this.$store.dispatch('getAvailableCollars', payload);
    },
  },
  mounted() {
    if (!this.collars.length) {
      this.loadNewCollars(1);
    }
  }
})
</script>