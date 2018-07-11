import Vue from 'vue';
import App from './components/App.vue';
import store from './store/store';
import VueRouter from 'vue-router';
import { PcapParser } from './parser/pcapparser'
import TraceWrapper from './data/TraceWrapper';
import axios from 'axios'
import { Ngtcp2LogParser } from './parser/Ngtcp2LogParser'
import './../node_modules/jquery/dist/jquery.min.js';
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './../node_modules/bootstrap/dist/js/bootstrap.min.js';
import './../node_modules/vue-multiselect/dist/vue-multiselect.min.css';
import './../node_modules/@fortawesome/fontawesome-free/css/all.css';

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

const request = 'http://localhost:8040/gettestfiles'

let data = axios.get(request).then((response) => { return response.data})
let pcapparser = new PcapParser()
let ngtcp2parser = new Ngtcp2LogParser()
data.then((result) => {
  let container = result['filescontainer']
  container.forEach(element => {
    let tracewrap = new TraceWrapper()
    
    if (element['fileext'] === '.json') {
      tracewrap.setTrace(pcapparser.parse(element['filename'], element['filecontent']))
      store.dispatch('addFile', tracewrap)
    }
    if (element['fileext'] === '.log') {
      tracewrap.setTrace(ngtcp2parser.parse(element['filename'], element['filecontent']))
      store.dispatch('addFile', tracewrap)
    }
  });
})

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
