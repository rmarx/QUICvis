<template>
  <div class="hello">
    {{ traces }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from '../../parser/pcapparser'
import TraceWrapper from '@/components/filecomponents/TraceWrapper';
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
        tracewrap.setTrace(pcapparser.parse(element['filename'], element['filecontent']))
        this.$store.dispatch('addFile', tracewrap)
      });
    })
  }
}
</script>

