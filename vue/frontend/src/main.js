import Vue from 'vue';

// Uncomment if babel-polyfill is required (but larger).
// import 'babel-polyfill'

import App from './App.vue';
import router from './router';
import store from './store';

import Vuesax from 'vuesax';
import VueClipboard from 'vue-clipboard2'
 
// import {vsButton,vsDivider,vsSideBar,vsIcon,vsNotifications} from 'vuesax'

import 'vuesax/dist/vuesax.css';
import 'material-icons/iconfont/material-icons.css';

import VCalendar from 'v-calendar';

Vue.config.productionTip = false;

Vue.use(Vuesax);
Vue.use(VueClipboard);

export const bus = new Vue();

Vue.use(VCalendar);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
