import Vue from 'vue';
import Vuex from 'vuex';
import VisSettings from '@/data/VisSettings';
import TraceWrapper from '@/data/TraceWrapper'
import { stat } from 'fs';

Vue.use(Vuex);

export interface File{
  filename: string
  fileindex: number
  conns: Array<boolean>
}

export default new Vuex.Store({
  state: {
    vissettings: new VisSettings(),
  },
  mutations: {
    addFile(state, tracewrap: TraceWrapper) {
      state.vissettings.addFile(tracewrap)
    },
    filterConn(state, data){
      let file = state.vissettings.getFile(data.fileindex)
      file.getConn(data.connindex).invertIsFiltered()
    },
    removeFile(state, index){
      state.vissettings.removeFile(index)
    }
  },
  getters: {
    getFiles(state): Array<TraceWrapper>{
      return state.vissettings.getAllFiles()
    },
    getFilesSettings(state): Array<File>{
      let filedata = state.vissettings.getAllFiles()
      let files = Array<File>()
      let filesettings: File
      for (let i = 0; i < filedata.length; i++) {
        filesettings = {
          filename: filedata[i].getTraceName(),
          fileindex: i,
          conns: filedata[i].getConnFilters()
        }
        files.push(filesettings)
      }

      return files
    },
  },
  actions: {
    addFile(context, tracewrap: TraceWrapper){
      context.commit('addFile', tracewrap)
    },
    filterConn(context, data){
      context.commit('filterConn', data)
    },
    removeFile(context, index){
      context.commit('removeFile', index)
    }
  }
});
