<template>
  <div class="hello">
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from '../parser/pcapparser'
export default {
  mounted() {
    let self = this
    const request = new Request('/pcaps/ngtcp2.json')

    var data = fetch(request).then((response) => {return response.json()})
    let pcapparser = new PcapParser()
    data.then((result) => {
      pcapparser.parse("testing", result)
    })
  }
}
</script>

