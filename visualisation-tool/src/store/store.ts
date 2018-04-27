import Vue from 'vue';
import Vuex from 'vuex';
import TraceWrapper from '@/components/filecomponents/TraceWrapper';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    files: Array<TraceWrapper>()
  },
  mutations: {
    addFile(state, tracewrap: TraceWrapper) {
      state.files.push(tracewrap)
    },
  },
  getters: {
    getFiles(state): Array<TraceWrapper>{
      return state.files
    }
  },
  actions: {
    addFile(context, tracewrap: TraceWrapper){
      context.commit('addFile', tracewrap)
    }
  }
});
