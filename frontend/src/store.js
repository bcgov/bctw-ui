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
    clusterCritters: true,
    collars: {
      availableCollars: [],
      assignableCollars: []
    }
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
        const species = ping.properties.species || 'Other';

        const herdStatus = state.filters.herdsActive.find((i) => {
          return i.name === herd;
        });

        const speciesStatus = state.filters.speciesActive.find((i) => {
          return i.name === species;
        });

        // Only return true if both species and population unit are true
        return herdStatus.on && speciesStatus.on;
      })

      state.pingsActive = {...state.pings};
      state.pingsActive.features = filteredHerds;
    },
    writeAvailableCollars (state, collars) {
      state.collars.availableCollars = collars;
    },
    writeAssignableCollars (state, collars) {
      state.collars.assignableCollars = collars;
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
    },
    assignedCollars(state) {
      return state.assignedCollars;
    },
    availableCollars(state) {
      return state.availableCollars;
    }
  },
  actions: {
    requestPings(context,callback) {
      const url = createUrl(context, `get-critters?time=${context.state.timeWindow}`);
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writePings',body);
        context.commit('filterPings');
        callback(); // run the callback
      })
    },
    requestMostRecentPings(context,callback) {
      const url = createUrl(context, 'get-last-pings');
      const options = createOptions({accept: 'application/vnd.github.full+json'});
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writePings',body);
        callback(); // run the callback
      })
    },
    requestCollars(context, callback) {
      const urlAvail = createUrl(context, 'get-available-collars')
      const urlAssign = createUrl(context, 'get-assigned-collars')
      const options = createOptions({});
      needle.get(urlAvail, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writeAvailableCollars',body);
      })
      needle.get(urlAssign, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        context.commit('writeAssignableCollars',body);
        callback(); // run the callback
      })
    }
  }
});

const createUrl = function(context, apiString) {
  const h1 = location.protocol;
  const h2 = location.hostname;
  const h3 = context.state.prod ? location.port : 3000;
  const h4 = context.state.prod ? '/api' : '';
  const url = `${h1}//${h2}:${h3}${h4}/${apiString}`;
  return url;
}

const createOptions = (obj) => {
  return {
    compressed: true,
    follow: 10,
    ...obj
  }
}
