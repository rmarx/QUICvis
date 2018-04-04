<template>
  <div class="hello">
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
export default {
  data: new ArrayBuffer(0),
  mounted() {
    let self = this
    const request = new Request('/pcaps/pcap_test.pcap')

    fetch(request).then((response) => {return response.arrayBuffer()}).then((data) => { this.data = data})

    var test = Array.prototype.map.call(new Uint8Array(this.data), (x:number) => ('00' + x.toString(16)).slice(-2)).join('');

    console.log("testing");
  }
}
</script>

