<template>
  <div class="hello">
    {{ traces }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from '../../parser/pcapparser'
import TraceWrapper from '@/components/filecomponents/TraceWrapper';
export default {
  computed:{ 
    traces() {
    return this.$store.getters.getFiles;
  }},
  mounted() {
    let self = this
    const request = new Request('/pcaps/ngtcp2_multiconn.json')

    let data = fetch(request).then((response) => {return response.json()})
    let pcapparser = new PcapParser()
    data.then((result) => {
      let tracewrap = new TraceWrapper()
      tracewrap.setTrace(pcapparser.parse("testing", result))
      this.$store.dispatch('addFile', tracewrap)
    })
  }
}
</script>

