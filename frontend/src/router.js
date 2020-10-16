import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

/*
 If I want to maintain parameters on route changes
 follow the instructions [here](https://stackoverflow.com/questions/45091380/vue-router-keep-query-parameter-and-use-same-view-for-children)

 Also notice the way components are defined by a function and a
 import statement below. Without doing this Parcel doesn't split them
 into separate code bases.
 */


var router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/protected/map',
      name: 'map',
      component: () => import('./views/Map.vue')
    },
    {
      path: '/protected/terrain',
      name: 'terrain',
      component: () => import('./views/Terrain.vue')
    },
    {
      path: '/protected/data',
      name: 'data',
      component: () => import('./views/Data.vue')
    }
  ]
});

router.afterEach((to,from) => {

  // Clear all buttons
  const btns = document.querySelectorAll('.vs-sidebar-item-active');
  btns.forEach( el => {
    el.classList.remove('vs-sidebar-item-active')
  });

  // Highlight correct button
  var item = document.querySelector("div.page-" + to.name);
  if (item) {
    item.classList.add('vs-sidebar-item-active');
  }
});

export default router;