import Vue from 'vue';
import Vuex from 'vuex';
import needle from 'needle';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    pings: null,
    prod: location.port == 1111 ? false : true,
    pingActive: {}
  },
  mutations: {
    pingActive (state,properties) {
      console.log(properties);
      state.pingActive = properties;
    },
    requestPings(state,callback) {
      const h1 = location.protocol;
      const h2 = location.hostname;
      const h3 = state.prod ? location.port : 3000;
      const h4 = state.prod ? '/api' : '';
      const url = `${h1}//${h2}:${h3}${h4}/get-critters`;
      console.log(url);
      const options = {
        compressed: true,
        follow: 10,
        accept: 'application/vnd.github.full+json'
      };
      needle.get(url, options, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        state.pings = body;
        callback(); // run the callback
      });
    },
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
    }
  },
  actions: {

  },
});