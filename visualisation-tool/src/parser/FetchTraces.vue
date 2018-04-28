<template>
  <div class="hello">
    {{ traces }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from './pcapparser'
import TraceWrapper from '../data/TraceWrapper';
import axios from 'axios'
export default {
  computed:{ 
    traces() {
    return this.$store.getters.getFiles;
  }},
  mounted() {
    let self = this
    const request = 'http://localhost:8040/gettestfiles'

    let data = axios.get(request).then((response) => { return response.data})
    let pcapparser = new PcapParser()
    data.then((result) => {
      let container = result['filescontainer']
      container.forEach(element => {
        let tracewrap = new TraceWrapper()
        if (element['fileext'] === '.json') {
          tracewrap.setTrace(pcapparser.parse(element['filename'], element['filecontent']))
          this.$store.dispatch('addFile', tracewrap)
        }
        else if (element['fileext'] === '.log')
          console.log(element)
      });
    })
  }
}
</script>

