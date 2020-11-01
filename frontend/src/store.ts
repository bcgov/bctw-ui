import Vue from 'vue';
import Vuex from 'vuex';
import needle from 'needle';
import {createOptions, createUrl} from './api/api_helpers';
import { codeModule } from './api/code_module';
import moment from 'moment';

Vue.use(Vuex);

const rootModule = {
  state: {
    prod: +(location.port) === 1111 ? false : true,
    pings: null,
    pingActive: {},
    pingsActive: [],
    pingsFocused: [],
    pingExtent: {}, // Amount of data available in the database
    filters: {
      herdsActive: [],
      speciesActive: [],
    },
    timeWindow: [], // TODO: to be calculated on getPingExtent
    clusterCritters: true,
    collars: {
      availableCollars: [],
      assignedCollars: [],
    },
    animals: [],
    editObject: {},
    addObject: {},
  },
  mutations: {
    pingActive(state, properties) {
      state.pingActive = properties;
    },
    timeWindow(state, time) {
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
    },
    writeAvailableCollars(state, collars) {
      state.collars.availableCollars = collars;
    },
    writeAssignedCollars(state, collars) {
      state.collars.assignedCollars = collars;
    },
    writeAnimals(state, animals) {
      state.animals = [...state.animals, ...animals];
      // state.animals = animals;
    },
    updateAddObject(state, obj) {
      console.log(`current obj ${JSON.stringify(state.addObject)}, newObj: ${JSON.stringify(obj)}`);
      state.addObject = obj;
    },
    updateEditingObject(state, newObj) {
      // console.log(`updated edit object ${JSON.stringify(newObj)}`);
      state.editObject = newObj;
    },
    updateAnimals(state, newAnimal) {
      const foundIndex = state.animals.findIndex(animal => animal.animal_id === newAnimal.animal_id);
      if (foundIndex !== -1) {
        state.animals[foundIndex] = newAnimal;
      } else {
        state.animals.push(newAnimal);
      }
    },
    upsertCodeHeader(state, payload) {
      console.log('im not working');
    },
    updateCollars(state, payload) {
      const type = payload.type;
      const collar = payload.collar;
      const collars = state.collars[type];
      const foundIndex = collars.findIndex(c => c.device_id === collar.device_id);
      state.collars[type][foundIndex] = collar;
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
    pingExtent (state) {
      return state.pingExtent;
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
    assignedCollars(state) {
      return state.assignedCollars;
    },
    availableCollars(state) {
      return state.availableCollars;
    },
    addObject(state) {
      return state.addObject;
    },
    editObject(state) {
      return state.editObject;
    },
    animals(state) {
      return state.animals;
    },
  },
  actions: {
    requestPings(context,callback) {
      const t = context.state.timeWindow;
      const url = createUrl(context, `get-critters?start=${t[0]}&end=${t[1]}`);
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {
          return console.error('Failed to fetch collars: ', err);
        }
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
        callback();
      });
    },
    requestPingExtent(context) {
      const url = createUrl(context, 'get-ping-extent');
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        const a = moment(body.min);
        const b = moment(body.max);
        body.days =  b.diff(a, 'days');
        console.log(body);
        // TODO: Should also commit to the timeWindow array

        context.commit('writePingExtent', body);
      });
    },
    requestCollars(context, callback) {
      const urlAvail = createUrl(context, 'get-available-collars')
      const urlAssign = createUrl(context, 'get-assigned-collars')
      const options = createOptions({});
      needle.get(urlAvail, options, (err,_,body) => {
        if (err) {
          return console.error('Failed to fetch collars: ', err);
        }
        context.commit('writeAvailableCollars', body);
      });
      needle.get(urlAssign, options, (err, _, body) => {
        if (err) {
          return console.error('Failed to fetch collars: ', err);
        }
        context.commit('writeAssignedCollars', body);
        callback(); // run the callback
      });
    },
    getAnimals(context, callback) {
      const urlAvail = createUrl(context, 'get-animals');
      const options = createOptions({});
      needle.get(urlAvail, options, (err, _, body) => {
        if (err) {
          return console.error('Failed to fetch animals: ', err);
        }
        context.commit('writeAnimals', body);
        callback(body);
      });
    },
    async upsertCollar(context, payload) {
      const url = createUrl(context, 'add-collar')
      const options = createOptions({});
      needle.post(url, payload.collar, options, (err, resp) => {
        if (err) {
          return console.error('unable to upsert collar', err);
        }
        const body = resp.body?.add_collar;
        context.commit('updateCollars', payload);
      });
      payload.callback();
    },
    async upsertAnimal(context, payload) {
      const url = createUrl(context, 'add-animal')
      const options = createOptions({});
      needle.post(url, payload.animal, options, (err, resp) => {
        if (err) {
          return console.error('unable to upsert animal', err);
        }
        const body = resp.body?.add_animal;
        context.commit('updateAnimals', payload.animal);
      });
      payload.callback();
    },
    async linkOrUnlinkCritterCollar(context, payload) {
      const isLink = payload.isLinking;
      const url = createUrl(context, isLink ? 'link-animal-collar' : 'unlink-animal-collar');
      const data = payload.data;
      const options = createOptions({});
      needle.post(url, data, options, (err, resp) => {
        if (err) {
          return console.error('unable to link animal to collar', err);
        }
        const body = resp.body;
      });
      payload.callback();
    },
  },
};

export default new Vuex.Store({
  modules: {
    codeModule,
    rootModule,
  },
});
