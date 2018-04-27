import Vue from 'vue';
import App from './components/App.vue';
import store from './store/store';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

Vue.config.productionTip = false;

const routes = [
  {
    path: '/pcaps/:name', component: App
  }
];

const router = new VueRouter({
  routes: routes
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
