import Vue from 'vue';
import App from './components/App.vue';
import AppSequence from './components/AppSequence.vue';
import AppTimeline from './components/AppTimeline.vue';
import store from './store/store';
import VueRouter from 'vue-router';
import TraceWrapper from './data/TraceWrapper';
import axios from 'axios'
import { Ngtcp2LogParser } from './parser/Ngtcp2LogParser'
import { QuickerLogParser } from '@/parser/QuickerLogParser';
import { PcapParser } from './parser/pcapparser'
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

/*
const request = 'http://'+ window.location.hostname +':8040/gettestfiles'

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
let quickerparser = new QuickerLogParser()
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

    if (element['fileext'] === '.quicker-log') {
      let parsedfile = quickerparser.parse(element['filename'], element['filecontent'])
      startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
      store.dispatch('addFile', tracewrap)
    }
  });
})
*/

store.dispatch('setVisSettings');

/*
let standaloneFiles = [
  "inc-0rtt-cl-ngtcp2.quicker-log.js",
  "inc-0rtt-cl-quant.quicker-log.js",
  "inc-0rtt-cl-quicker.quicker-log.js",
  "inc-0rtt-se-ngtcp2.ngtcp2-log.js",
  "inc-0rtt-se-quicker.quicker-log.js",
  "inc-0rtt-ts-ngtcp2.json.js",
  "inc-0rtt-ts-quant.json.js",
  "inc-0rtt-ts-quicker.json.js",
  "two-initial-cl-ngtcp2.quicker-log.js",
  "two-initial-cl-quant.quicker-log.js",
  "two-initial-cl-quicker.quicker-log.js",
  "two-initial-se-ngtcp2.ngtcp2-log.js",
  "two-initial-se-quicker.quicker-log.js",
  "two-initial-ts-ngtcp2.json.js",
  "two-initial-ts-quant.json.js",
  "two-initial-ts-quicker.json.js",
  "dupli-pkts-cl-ngtcp2.quicker-log.js",
  "dupli-pkts-cl-quant.quicker-log.js",
  "dupli-pkts-cl-quicker.quicker-log.js",
  "dupli-pkts-se-ngtcp2.ngtcp2-log.js",
  "dupli-pkts-se-quicker.quicker-log.js",
  "dupli-pkts-ts-ngtcp2.json.js",
  "dupli-pkts-ts-quant.json.js",
  "dupli-pkts-ts-quicker.json.js",
  "exceed-md-cl-ngtcp2.quicker-log.js",
  "exceed-md-cl-quant.quicker-log.js",
  "exceed-md-cl-quicker.quicker-log.js",
  "exceed-md-se-ngtcp2.ngtcp2-log.js",
  "exceed-md-se-quicker.quicker-log.js",
  "exceed-md-ts-ngtcp2.json.js",
  "exceed-md-ts-quant.json.js",
  "exceed-md-ts-quicker.json.js",
  "ngtcp-multistreams-client.ngtcp2-log.js",
  "ngtcp-multistreams-server.ngtcp2-log.js",
  "ngtcp2-multistreams-tshark.json.js",
  "ntwrk-off-cl-ngtcp2.quicker-log.js",
  "ntwrk-off-cl-quant.quicker-log.js",
  "ntwrk-off-cl-quicker.quicker-log.js",
  "ntwrk-off-se-ngtcp2.ngtcp2-log.js",
  "ntwrk-off-se-quicker.quicker-log.js",
  "ntwrk-off-ts-ngtcp2.json.js",
  "ntwrk-off-ts-quant.json.js",
  "ntwrk-off-ts-quicker.json.js",
  "pkts-reorder-cl-ngtcp2.quicker-log.js",
  "pkts-reorder-cl-quant.quicker-log.js",
  "pkts-reorder-cl-quicker.quicker-log.js",
  "pkts-reorder-se-ngtcp2.ngtcp2-log.js",
  "pkts-reorder-se-quicker.quicker-log.js",
  "pkts-reorder-ts-ngtcp2.json.js",
  "pkts-reorder-ts-quant.json.js",
  "pkts-reorder-ts-quicker.json.js"
]

for( let filepath of standaloneFiles ){

  let scriptelement = document.createElement('script');
  scriptelement.onload = function () {
      // the standalone file has a single variable in it, named after the file, so we can get the contents
      // e.g., var dupli_pkts_cl_ngtcp2 = {...}
      // since it's a 'var' and not 'let', we can access it via the window[]
      let varname = filepath.substr(0, filepath.indexOf(".")); // dupli-pkts-cl-ngtcp2.quicker-log.js -> dupli-pkts-cl-ngtcp2
      varname = varname.replace(new RegExp("-", 'g'), "_"); // dupli-pkts-cl-ngtcp2 -> dupli_pkts_cl_ngtcp2

      //@ts-ignore 
      let file = window[varname];
      window[varname] = "loaded"; // make sure it can be gc'ed if necessary

      let tracewrap = new TraceWrapper();

      if (file['fileext'] === '.json') {
        let parsedfile = pcapparser.parse(file['filename'], file['filecontent'])
        startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
        store.dispatch('addFile', tracewrap)
      }
      if (file['fileext'] === '.ngtcp2-log') {
        let parsedfile = ngtcp2parser.parse(file['filename'], file['filecontent'])
        startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
        store.dispatch('addFile', tracewrap)
      }
  
      if (file['fileext'] === '.quicker-log') {
        let parsedfile = quickerparser.parse(file['filename'], file['filecontent'])
        startcolor = tracewrap.setTrace(parsedfile, startcolor, conncolors)
        store.dispatch('addFile', tracewrap)
      }
  };
  scriptelement.src = "standalone/" + filepath;

  //document.head.appendChild(scriptelement);
}
*/

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
