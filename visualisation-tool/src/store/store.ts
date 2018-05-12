import Vue from 'vue';
import Vuex from 'vuex';
import VisSettings from '@/data/VisSettings';
import TraceWrapper from '@/data/TraceWrapper'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    settings: new VisSettings()
  },
  mutations: {
    addFile(state, tracewrap: TraceWrapper) {
      state.settings.addFile(tracewrap)
    },
  },
  getters: {
    getFiles(state): Array<TraceWrapper>{
      return state.settings.getAllFiles()
    }
  },
  actions: {
    addFile(context, tracewrap: TraceWrapper){
      context.commit('addFile', tracewrap)
    }
  }
});
