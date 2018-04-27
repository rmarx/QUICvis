<template>
  <div class="hello">
    {{ traces }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from '../../parser/pcapparser'
export default {
  data() {
    return {
      traces: null
    }
  },
  mounted() {
    let self = this
    const request = new Request('/pcaps/ngtcp2_multiconn.json')

    let data = fetch(request).then((response) => {return response.json()})
    let pcapparser = new PcapParser()
    data.then((result) => {
      this.traces = JSON.stringify(pcapparser.parse("testing", result), undefined, 2)
    })
  }
}
</script>

