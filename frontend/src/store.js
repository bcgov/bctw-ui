import Vue from 'vue';
import Vuex from 'vuex';
import request from 'request';

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
      const url = (state.prod) ? 
        `${h1}//${h2}/get-collars` :
        `${h1}//${h2}:3000/get-collars`;
      request(url, (err,_,body) => {
        if (err) {return console.error('Failed to fetch collars: ',err)};
        state.pings = JSON.parse(body);
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
