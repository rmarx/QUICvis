import Vue from 'vue';
import App from './components/App.vue';
import AppSequence from './components/AppSequence.vue';
import AppTimeline from './components/AppTimeline.vue';
import store from './store/store';
import VueRouter from 'vue-router';
import { PcapParser } from './parser/pcapparser'
import TraceWrapper from './data/TraceWrapper';
import axios from 'axios'
import { Ngtcp2LogParser } from './parser/Ngtcp2LogParser'
import './../node_modules/jquery/dist/jquery.min.js';
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './../node_modules/bootstrap/dist/js/bootstrap.min.js';
import './../node_modules/@fortawesome/fontawesome-free/css/all.css';

Vue.use(VueRouter);

Vue.config.productionTip = false;

const routes = [
  {
    path: '/', component: AppTimeline
  },
  {
    path: '/sequence', component: AppSequence
  }
];

const router = new VueRouter({
  routes: routes
});

const request = 'http://localhost:8040/gettestfiles'

let conncolors = [
  '#f98b7f',
  '#f9b97f',
  '#f2dc8e',
  '#a5965e',
  '#e4ef83',
  '#b1dd6e',
  '#82d87d',
  '#7dd8bb',
  '#7dd4d8',
  '#9189ff'
]

let data = axios.get(request).then((response) => { return response.data })
let pcapparser = new PcapParser()
let ngtcp2parser = new Ngtcp2LogParser()
let startcolor = 0
data.then((result) => {
  let container = result['filescontainer']
  container.forEach(element => {
    let tracewrap = new TraceWrapper()

    if (element['fileext'] === '.json') {
      let parsedfile = pcapparser.parse(element['filename'], element['filecontent'])
      startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
      store.dispatch('addFile', tracewrap)
    }
    if (element['fileext'] === '.ngtcp2-log') {
      let parsedfile = ngtcp2parser.parse(element['filename'], element['filecontent'])
      startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
      store.dispatch('addFile', tracewrap)
    }
  });
})

store.dispatch('setVisSettings')

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
