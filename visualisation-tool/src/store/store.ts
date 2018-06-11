import Vue from 'vue';
import Vuex from 'vuex';
import VisSettings from '@/data/VisSettings';
import TraceWrapper from '@/data/TraceWrapper'
import { stat } from 'fs';
import TimeSettings from '@/data/TimeSettings';

Vue.use(Vuex);

export interface File{
  filename: string
  fileindex: number
  conns: Array<boolean>
}

export default new Vuex.Store({
  state: {
    vissettings: new VisSettings(),
    timesettings: new TimeSettings()
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
    },
    initScale(state, data){
      state.timesettings.initScale(data.maxwidth, data.startdom, data.enddom)
    },
    setDomain(state, data){
      state.timesettings.setDomain(data.startdom, data.enddom)
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
    getTimeScale(state): d3.ScaleLinear<number, number>{
      let scale = state.timesettings.getScale()
      return scale;
    }
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
    },
    initScale(context, data){
      context.commit('initScale', data)
    },
    setDomain(context, data){
      context.commit('setDomain', data)
    }
  }
});
