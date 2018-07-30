import Vue from 'vue';
import Vuex from 'vuex';
import VisSettings from '@/data/VisSettings';
import TraceWrapper from '@/data/TraceWrapper'
import { stat } from 'fs';
import TimeScaleState from '@/data/TimeScaleState';
import TableState from '@/data/TableState';
import { Header } from '@/data/quic';
import FrameColorTables from '@/data/frametables/FrameColorTables';
import SequenceSettings from '@/data/SequenceSettings';
import { stackOffsetExpand } from 'd3';

Vue.use(Vuex);

export interface File{
  filename: string
  fileindex: number
  conns: Array<boolean>
}

export default new Vuex.Store({
  state: {
    vissettings: new VisSettings(),
    timescalestate: new TimeScaleState(),
    tablestate: new TableState(),
    framecolortables: new FrameColorTables(),
    sequencesettings: new SequenceSettings(),
  },
  mutations: {
    addFile(state, tracewrap: TraceWrapper) {
      state.vissettings.addFile(tracewrap)
    },
    filterConn(state, data){
      let file = state.vissettings.getFile(data.fileindex)
      file.getConn(data.connindex).invertIsFiltered()
    },
    filterStream(state, data){
      state.vissettings.getFile(data.traceid).getConn(data.connid).filterOutStream(data.streamnr);
    },
    removeFile(state, index){
      state.vissettings.removeFile(index)
    },
    setBgColor(state, data){
      state.vissettings.getFile(data.traceid).getConn(data.connid).setBgColor(data.color)
    },
    resetStreamFilters(state, data){
      state.vissettings.getFile(data.traceid).getConn(data.connid).resetStreamFilters()
    },
    setTimeScaleRange(state, data){
      state.timescalestate.setDimensions(data.width, data.height)
    },
    setTimeScaleDomain(state, data){
      state.timescalestate.setDomain(data.start, data.end)
    },
    setZoom(state){
      state.timescalestate.setZoom();
    },
    filterTableHeader(state, name){
      state.tablestate.filterHeader(name)
    },
    setSelectedPacket(state, data){
      state.vissettings.getFile(data.traceid).getConn(data.connid).setSelectedPacket(data.packetid);
      state.vissettings.setSelectedPacket(data.packetid, data.connid, data.traceid);
    },
    toggleShowStreams(state, data){
      state.vissettings.getFile(data.traceid).getConn(data.connid).toggleShowStreams();
    },
    setXOffset(state, data) {
      state.vissettings.getFile(data.traceid).getConn(data.connid).setXOffset(data.xoffset);
    },
    switchFrameColorTable(state, name){
      state.framecolortables.switchTable(name)
    },
    setSequenceTraceIndex(state, data){
      if (data.tracenumber === 1)
        state.sequencesettings.setTraceindex1(data.traceindex)
      else
        state.sequencesettings.setTraceindex2(data.traceindex)
    },
    setSequenceConnIndex(state, data){
      if (data.connnumber === 1)
        state.sequencesettings.setConnindex1(data.connindex)
      else
        state.sequencesettings.setConnindex2(data.connindex)
    },
    setSequenceRtt(state, rtt){
      state.sequencesettings.set1filertt(rtt)
    },
    setVisSettings(state){
      state.sequencesettings.setVisSettings(state.vissettings)
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
    getFileByIndex(state) {
      return fileindex => state.vissettings.getFile(fileindex)
    },
    getFilteredConnsInFile(state) {
      return fileindex => state.vissettings.getFile(fileindex).getFilteredConns()
    },
    getAllFilteredConns(state) {
      let conns = new Array<{fileindex: number, connid: number, headerinfo: Header|null}>()
      state.vissettings.getAllFiles().forEach((trace, traceindex) => {
        trace.getFilteredConns().forEach((conn) => {
          conns.push({fileindex: traceindex, connid: conn, headerinfo: state.vissettings.getFile(traceindex).getConn(conn).getSelectedPacket()!.headerinfo})
        })
      })
      return conns
    },
    getBgColorOfConn(state) {
      return fileindex => connindex => state.vissettings.getFile(fileindex).getConn(connindex).getBgColor()
    },
    getConnByIndex(state){
      return fileindex => connindex => state.vissettings.getFile(fileindex).getConn(connindex)
    },
    getStreamFilters(state){
      return fileindex => connindex => state.vissettings.getFile(fileindex).getConn(connindex).getStreamFilters()
    },
    getPacketsByConn(state){
      return fileindex => connindex => state.vissettings.getFile(fileindex).getConn(connindex).getConn().packets
    },
    getTableHeaders(state){
      return state.tablestate.getTableHeaders()
    },
    getSelectedPacket(state){
      return fileindex => connindex => state.vissettings.getFile(fileindex).getConn(connindex).getSelectedPacket()
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
    setBgColor(context, data) {
      context.commit('setBgColor', data)
    },
    resetStreamFilters(context, data) {
      context.commit('resetStreamFilters', data)
    },
    setTimeScaleRange(context, data){
      context.commit('setTimeScaleRange', data)
    },
    setTimeScaleDomain(context, data){
      context.commit('setTimeScaleDomain',data)
    },
    setZoom(context){
      context.commit('setZoom')
    },
    filterTableHeader(context, name){
      context.commit('filterTableHeader', name)
    },
    setSelectedPacket(context, data){
      context.commit('setSelectedPacket', data)
    },
    toggleShowStreams(context, data){
      context.commit('toggleShowStreams', data)
    },
    setXOffset(context, data){
      context.commit('setXOffset', data)
    },
    filterStream(context, data){
      context.commit('filterStream', data)
    },
    switchFrameColorTable(context, name){
      context.commit('switchFrameColorTable', name)
    },
    setSequenceTraceIndex(context, data){
      context.commit('setSequenceTraceIndex', data)
    },
    setSequenceConnIndex(context, data){
      context.commit('setSequenceConnIndex', data)
    },
    setSequenceRtt(context, rtt){
      context.commit('setSequenceRtt', rtt)
    },
    setVisSettings(context){
      context.commit('setVisSettings')
    }
  }
});
