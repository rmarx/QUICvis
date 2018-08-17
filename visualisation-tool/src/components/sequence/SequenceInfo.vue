<template>
    <div id="sequenceinfo">
      <div id="endpoint1container">
        <h3 class="w-100">Endpoint1</h3>
        <label for="endpoint1-trace" class="w-25">Input file:</label>
        <select class="custom-select w-75" id="endpoint1-trace" v-model="trace1_index" @change="changeSelectedTrace_1()">
          <option value="-1">None</option>
          <option v-for="(name, index) in filenames" v-bind:value="index">{{name}}</option>
        </select>
        <label for="endpoint1-conn" class="w-25">Conn:</label>
        <select class="custom-select w-75" id="endpoint1-conn" v-model="conn1_index" @change="changeSelectedConn_1()">
          <option value="-1">None</option>
          <option v-for="index in connids_trace1" v-bind:value="index - 1">Conn {{ index}}</option>
        </select>
        <label for="time_scale" class="w-25">Scale (pixel/ms)</label>
        <input type="number" id="time_scale" v-model="time_scale" @change="changeTimescale()">
      </div>

      <div id="filterbuttons">
        <button v-for="filter in seqfilters" v-bind:class="'float-left btn btn-sm ' + filterButtonStyle(filter.name)" @click="filterPressed(filter.name)">{{ buttonText(filter.name)}}</button>
      </div>

      <div id="endpoint2container">
        <h3 class="w-100">Endpoint2</h3>
        <label for="endpoint2-trace" class="w-25">Input file:</label>
        <select class="custom-select w-75" id="endpoint2-trace" v-model="trace2_index" @change="changeSelectedTrace_2()">
          <option value="-1">None</option>
          <option v-for="(name, index) in filenames" v-bind:value="index">{{name}}</option>
        </select>
        <label for="endpoint2-conn" class="w-25">Conn:</label>
        <select class="custom-select w-75" id="endpoint2-conn" v-model="conn2_index" @change="changeSelectedConn_2()">
          <option value="-1">None</option>
          <option v-for="index in connids_trace2" v-bind:value="index - 1">Conn {{ index}}</option>
        </select>
        <label for="endpoint2-rtt" class="w-25">RTT (ms)</label>
        <input type="number" id="endpoint2-rtt" v-model="rtt_amount" @change="changeRtt()">
      </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default {
  name: "SequenceInfo",
  data(){
    return {
      trace1_index: -1,
      trace2_index: -1,
      conn1_index: -1,
      conn2_index: -1,
      rtt_amount: this.$store.state.sequencesettings.get1filertt(),
      time_scale: this.$store.state.sequencesettings.getTimeScale()
    }
  },
  computed: {
    filenames() {
      return this.$store.state.vissettings.getAllFileNames()
    },
    connids_trace1(){
      if (this.trace1_index > -1 )
        return this.$store.state.vissettings.getFile(this.trace1_index).getAmountConns()
      else 
        return 0
    },
    connids_trace2(){
      if (this.trace2_index > -1 )
        return this.$store.state.vissettings.getFile(this.trace2_index).getAmountConns()
      else
        return 0
    },
    test(){
      return this.$store.state.sequencesettings.getConnindex2()
    },
    seqfilters(){
      return this.$store.state.sequencesettings.getAllSeqFilters()
    }
  },
  methods: {
    changeRtt(){
      this.$store.dispatch('setSequenceRtt', this.rtt_amount)
    },
    changeSelectedTrace_1(){
      this.conn1_index = 0
      let data = {
        tracenumber: 1,
        traceindex: this.trace1_index
      }
      this.$store.dispatch('setSequenceTraceIndex', data)
      this.changeSelectedConn_1()
    },
    changeSelectedTrace_2(){
      this.conn2_index = 0
      let data = {
        tracenumber: 2,
        traceindex: this.trace2_index
      }
      this.$store.dispatch('setSequenceTraceIndex', data)
      this.changeSelectedConn_2()
    },
    changeSelectedConn_1(){
      let data = {
        connnumber: 1,
        connindex: this.conn1_index
      }
      this.$store.dispatch('setSequenceConnIndex', data)
    },
    changeSelectedConn_2(){
      let data = {
        connnumber: 2,
        connindex: this.conn2_index
      }
      this.$store.dispatch('setSequenceConnIndex', data)
    },
    filterButtonStyle(name: string){
      let value = this.$store.state.sequencesettings.getSeqFilter(name)

      if (value) {
        return 'btn-primary'
      }
      else
        return 'btn-secondary'
    },
    buttonText(name: string){
      let value = this.$store.state.sequencesettings.getSeqFilter(name)

      if (value) {
        return 'Hide ' + name
      }
      else
        return 'Show ' + name
    },
    filterPressed(name: string){
      this.$store.dispatch('changeSeqFilter', name)
    },
    changeTimescale(){
      this.$store.dispatch('setSequenceScale', this.time_scale)
    }
  }
}
</script>

<style>
#sequenceinfo{
    width: 1000px;
    height: 180px;
    border: black solid 1px;
    margin-left: 300px;
}

#endpoint1container{
  float: left;
  background-color: darkcyan;
  height: 180px;
  width: 300px;
}

#filterbuttons{
  float: left;
  height: 180px;
  width: 370px;
}

#endpoint2container{
  float: right;
  background-color: darkcyan;
  height: 180px;
  width: 300px;
}
</style>
