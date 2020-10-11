import Vue from 'vue';
import Vuex from 'vuex';
import needle from 'needle';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    prod: location.port == 1111 ? false : true,
    pings: null,
    pingActive: {},
    pingsActive: [],
    pingsFocused: [],
    filters: {
      herdsActive: [],
      speciesActive: []
    },
    timeWindow: '1 days',
    clusterCritters: true
  },
  mutations: {
    pingActive (state,properties) {
      state.pingActive = properties;
    },
    timeWindow (state,time) {
      state.timeWindow = time;
    },
    toggleClusterCritters (state,checked) {
      state.clusterCritters = checked;
    },
    writePings (state,pings) {
      state.pings = pings;
    },
    herdsActive (state,units) {
      state.filters.herdsActive = units;
    },
    speciesActive (state,species) {
      state.filters.speciesActive = species;
    },
    filterPings (state) {
      const filteredHerds = state.pings.features.filter((ping) => {
        const herd = ping.properties.population_unit || 'Other';

        const herdStatus = state.filters.herdsActive.find((i) => {
          return i.name === herd;
        });
        return herdStatus.on;
      })

      state.pingsActive = {...state.pings};
      state.pingsActive.features = filteredHerds;
    }
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
    clusterCritters (state) {
      return state.clusterCritters;
    },
    herdsActive (state) {
      return state.filters.herdsActive;
    },
    speciesActive (state) {
      return state.filters.speciesActive;
    }
  },
  actions: {
    requestPings(context,callback) {
      const h1 = location.protocol;
      const h2 = location.hostname;
      const h3 = context.state.prod ? location.port : 3000;
      const h4 = context.state.prod ? '/api' : '';
      const url = `${h1}//${h2}:${h3}${h4}/get-critters?time=${context.state.timeWindow}`;
      const options = {
        compressed: true,
        follow: 10,
        accept: 'application/vnd.github.full+json'
      };
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writePings',body);
        context.commit('filterPings');
        callback(); // run the callback
      })
    },
    requestMostRecentPings(context,callback) {
      const h1 = location.protocol;
      const h2 = location.hostname;
      const h3 = context.state.prod ? location.port : 3000;
      const h4 = context.state.prod ? '/api' : '';
      const url = `${h1}//${h2}:${h3}${h4}/get-last-pings`;
      const options = {
        compressed: true,
        follow: 10,
        accept: 'application/vnd.github.full+json'
      };
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writePings',body);
        callback(); // run the callback
      })
    }
  }
});
