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
      const h3 = location.port;
      const url = `${h1}//${h2}:${h3}/api/get-collars`;
      const options = {
        compressed: true
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
