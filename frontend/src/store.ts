import Vue from 'vue';
import Vuex from 'vuex';
import needle, { NeedleResponse } from 'needle';
import {createOptions, createUrl, createUrl2} from './api/api_helpers';
import { codeModule } from './api/code_module';
import { animalModule } from './api/animal_module';
import moment from 'moment';
import { Collar, ICollar, decodeCollar } from './types/collar';
import { ActionGetPayload, ActionPostPayload } from './types/store';

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
    editObject: {},
  },
  mutations: {
    pingActive(state, properties) {
      state.pingActive = properties;
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
    },
    writeAvailableCollars(state, collars) {
      const newIds = collars.map((c: Collar) => c.device_id);
      const filtered = state.collars.availableCollars.filter((c: Collar) => !newIds.includes(c.device_id));
      state.collars.availableCollars = [...filtered, ...collars];
    },
    writeAssignedCollars(state, collars) {
      const newIds = collars.map((c: Collar) => c.device_id);
      const filtered = state.collars.assignedCollars.filter((c: Collar) => !newIds.includes(c.device_id));
      state.collars.assignedCollars = [...filtered, ...collars];
    },
    updateEditObject(state, obj) {
      state.editObject = Object.assign({}, obj);
      // console.log(JSON.stringify(state.editObject));
    },
    updateCollars(state, payload) {
      const type = payload.type;
      const collar = payload.collar;
      const collars = state.collars[type];
      const foundIndex = collars.findIndex((c: ICollar) => c.device_id === collar.device_id);
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
    assignedCollars(state) {
      return state.collars.assignedCollars;
    },
    availableCollars(state) {
      return state.collars.availableCollars;
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
    async requestCollars(context, callback) {
      await context.dispatch('getAvailableCollars', {callback});
      await context.dispatch('getAssignedCollars', {callback});
      callback();
    },
    async getAvailableCollars(context, payload: ActionGetPayload) {
      const {callback, page} = payload;
      const urlAvail = createUrl2({context, apiString: 'get-available-collars', page});
      const errMsg = `error fetching available collars:`;
      try {
        const response: NeedleResponse = await needle('get', urlAvail, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          const collars: Collar[] = body.map((c: any) => decodeCollar(c));
          context.commit('writeAvailableCollars', collars);
        } else {
          callback(null, `${errMsg} ${body}`);
        }
      } catch (e) {
          callback(null, `${errMsg} ${e}`);
      }
    },
    async getAssignedCollars(context, payload) {
      const {callback, page} = payload;
      const urlAssign = createUrl2({context, apiString: 'get-assigned-collars', page});
      const errMsg = `error fetching assigned collars:`;
      try {
        const response: NeedleResponse = await needle('get', urlAssign, createOptions({}));
        const body = response.body;
        if (response && response.statusCode === 200) {
          const collars: Collar[] = body.map((c: any) => decodeCollar(c));
          context.commit('writeAssignedCollars', collars);
        } else {
          callback(null, `${errMsg} ${body}`);
        }
      } catch (e) {
          callback(null, `${errMsg} ${e}`);
      }
    },
    upsertCollar(context, payload) {
      const url = createUrl(context, 'add-collar');
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
  },
};

export default new Vuex.Store({
  modules: {
    animalModule,
    codeModule,
    rootModule,
  },
});
