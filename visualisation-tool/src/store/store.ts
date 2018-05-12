import Vue from 'vue';
import Vuex from 'vuex';
import VisSettings from '@/data/VisSettings';
import TraceWrapper from '@/data/TraceWrapper'

Vue.use(Vuex);

export interface File{
  filename: string
  fileindex: number
  amountconns: number
}

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
    },
    getFilesSettings(state): Array<File>{
      let filedata = state.settings.getAllFiles()
      let files = Array<File>()
      let filesettings: File
      for (let i = 0; i < filedata.length; i++) {
        filesettings = {
          filename: filedata[i].getTraceName(),
          fileindex: i,
          amountconns: filedata[i].getAmountConns()
        }
        files.push(filesettings)
      }

      return files
    }
  },
  actions: {
    addFile(context, tracewrap: TraceWrapper){
      context.commit('addFile', tracewrap)
    }
  }
});
