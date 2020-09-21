import Vue from 'vue';
import Vuex from 'vuex';
import needle from 'needle';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    prod: location.port == 1111 ? false : true,
    pings: null,
    pingActive: {},
    pingsFocused: [],
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
    writePings(state,pings) {
      state.pings = pings;
    }
  },
  getters: {
    hasPings (state) {
      return state.pings !== null;
    },
    pings (state) {
      return state.pings;
    },
    pingActive (state) {
      return state.pingActive;
    },
    clusterCritters (state) {
      return state.clusterCritters;
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
