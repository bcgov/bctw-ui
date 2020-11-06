import Vue from 'vue';

// Uncomment if babel-polyfill is required (but larger).
// import 'babel-polyfill'

import App from './App.vue';
import router from './router';
import store from './store';

import Vuesax from 'vuesax';
// import {vsButton,vsDivider,vsSideBar,vsIcon,vsNotifications} from 'vuesax'

import 'vuesax/dist/vuesax.css';
import 'material-icons/iconfont/material-icons.css';

Vue.config.productionTip = false;

Vue.use(Vuesax);
// Vue.use(vsButton);
// Vue.use(vsDivider);
// Vue.use(vsSideBar);
// Vue.use(vsNotifications);
// Vue.use(vsIcon);

export const bus = new Vue();

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
