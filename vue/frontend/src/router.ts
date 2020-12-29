import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Map from './views/Map.vue';
import Data from './views/Data.vue';
import Terrain from './views/Terrain.vue';


Vue.use(Router);

/*
 If I want to maintain parameters on route changes
 follow the instructions [here](https://stackoverflow.com/questions/45091380/vue-router-keep-query-parameter-and-use-same-view-for-children)

 Also notice the way components are defined by a function and a
 import statement below. Without doing this Parcel doesn't split them
 into separate code bases.
 */


const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/protected/map',
      name: 'map',
      component: Map,
    },
    {
      path: '/protected/terrain',
      name: 'terrain',
      component: Terrain,
    },
    {
      path: '/protected/data',
      name: 'data',
      component: Data,
    },
  ],
});

router.afterEach((to, from) => {

  // Clear all buttons
  const btns = document.querySelectorAll('.vs-sidebar-item-active');
  btns.forEach( (el) => {
    el.classList.remove('vs-sidebar-item-active');
  });

  // Highlight correct button
  const item = document.querySelector('div.page-' + to.name);
  if (item) {
    item.classList.add('vs-sidebar-item-active');
  }
});

export default router;
