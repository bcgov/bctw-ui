import Vue from 'vue';
import Vuex from 'vuex';
import needle from 'needle';
import {createOptions, createUrl} from './api/api_helpers';
import { animalModule } from './api/animal_module';
import { codeModule } from './api/code_module';
import { collarModule } from './api/collar_module';
import moment from 'moment';

import {bus} from './main';

Vue.use(Vuex);

const rootModule = {
  state: {
    prod: +(location.port) === 1111 ? false : true,
    pings: null,
    pingActive: {},
    pingsActive: [],
    pingsSelected: [],
    pingExtent: {}, // Amount of data available in the database
    filters: {
      herdsActive: [],
      speciesActive: [],
    },
    timeWindow: [], // TODO: to be calculated on getPingExtent
    clusterCritters: true,
    editObject: {},
    testUser: 'My IDIR',
    testUsers: ['My IDIR', 'Biologist1', 'Biologist2', 'Admin'],
  },
  mutations: {
    pingActive(state, properties) {
      state.pingActive = properties;
    },
    pingsActive(state, properties) {
      state.pingsActive = properties;
    },
    pingsSelected(state, properties) {
      state.pingsSelected = properties;
    },
    writeTimeWindow(state, time) {
      state.timeWindow = time;
    },
    toggleClusterCritters(state, checked) {
      state.clusterCritters = checked;
    },
    writePings(state, pings) {
      state.pings = pings;
    },
    writePingExtent(state, extent) {
      state.pingExtent = extent;
    },
    herdsActive(state, units) {
      state.filters.herdsActive = units;
    },
    speciesActive(state, species) {
      state.filters.speciesActive = species;
    },
    filterPings(state) {
      const filteredHerds = state.pings.features.filter((ping) => {
        const herd = ping.properties.population_unit || 'Other';
        const species = ping.properties.species || 'Other';

        const herdStatus = state.filters.herdsActive.find((i) => {
          return i.name === herd;
        });

        const speciesStatus = state.filters.speciesActive.find((i) => {
          return i.name === species;
        });

        // Only return true if both species and population unit are true
        return herdStatus.on && speciesStatus.on;
      });

      state.pingsActive = {...state.pings};
      state.pingsActive.features = filteredHerds;
      bus.$emit('refreshCritterLayers'); // Signal map to refresh collar layer
    },
    updateEditObject(state, obj) {
      state.editObject = Object.assign({}, obj);
    },
    updateTestUser(state, user) {
      state.testUser = user;
    },
  },
  getters: {
    hasPings (state) {
      return state.pings !== null;
    },
    pings (state) {
      return state.pings;
    },
    pingsActive (state) {
      return state.pingsActive;
    },
    pingActive (state) {
      return state.pingActive;
    },
    pingsSelected (state) {
      return state.pingsSelected;
    },
    pingExtent (state) {
      return state.pingExtent;
    },
    timeWindow (state) {
      return state.timeWindow;
    },
    clusterCritters (state) {
      return state.clusterCritters;
    },
    herdsActive (state) {
      return state.filters.herdsActive;
    },
    speciesActive (state) {
      return state.filters.speciesActive;
    },
    editObject(state) {
      return state.editObject;
    },
    testUsers(state) {
      return state.testUsers;
    },
    testUser(state) {
      return state.testUser;
    },
  },
  actions: {
    requestPings(context,callback) {
      const t = context.state.timeWindow;
      const e = context.getters.pingExtent;
      const start = moment(e.min).add(t[0], 'days').format('YYYY-MM-DD');
      const end = moment(e.min).add(t[1], 'days').format('YYYY-MM-DD');

      const url = createUrl(context, `get-critters?start=${start}&end=${end}`);
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {
          return console.error('Failed to fetch collars: ', err);
        }
        console.log('pings sent: ', body.features.length);
        context.commit('writePings', body);
        context.commit('filterPings');
        callback(); // run the callback
      });
    },
    requestMostRecentPings(context, callback) {
      const url = createUrl(context, 'get-last-pings');
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err, _, body) => {
        if (err) {
          return console.error('Failed to fetch collars: ', err);
        }
        context.commit('writePings', body);
        context.commit('filterPings');
        callback();
      });
    },
    requestPingExtent(context, callback) {
      console.log('callback:', callback);
      const url = createUrl(context, 'get-ping-extent');
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ', err); }
        /* Calculate the temporal extent of all pings */
        const a = moment(body.min);
        const b = moment(body.max);
        body.days =  b.diff(a, 'days');
        context.commit('writePingExtent', body);
        /* Calculate the temporal window of downloaded pings */
        const end = body.days - 1;
        const start = body.days - 50;
        context.commit('writeTimeWindow',[start,end]);
        callback();
      });
    },
    async changeTestUser(context, user: string) {
      context.commit('updateTestUser', user);
      await context.dispatch('resetCollars', () => console.log('collars reset'));
      await context.dispatch('resetCritters', () => console.log('critters reset'));
    },
  },
};

export default new Vuex.Store({
  modules: {
    animalModule,
    codeModule,
    collarModule,
    rootModule,
  },
});
