<template>
    <svg id="sequencediagram" v-if="validfiles" v-bind:height="getLargestTime + 'px'">
        <line x1="150" y1="-100" x2="150" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
        <line x1="850" y1="-100" x2="850" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
        <SequenceArrow v-for="(packets, index) in sequencepackets" :packet_conn1="packets.packet_conn1" :packet_conn2="packets.packet_conn2" :baseheight="(index * margin)" :rttscale="getRTTScale"/>
    </svg>
    <div id="nodiagram" v-else>
        Current file selection is invalid
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import SequenceArrow from './SequenceArrow.vue'
export default {
  name: "SequenceDiagram",
  data() {
      return {
          margin: 50
      }
  },
  computed: {
      validfiles() {
          return this.$store.state.sequencesettings.getValidFiles()
      },
      sequencepackets() {
          return this.$store.state.sequencesettings.getPackets()
      },
      getLargestTime(){
          return ((this.$store.state.sequencesettings.getLargestTime() * 1000 * 10) + (this.sequencepackets.length * this.margin))
      },
      getRTTScale(){
          let originalRTT = this.$store.state.sequencesettings.getFirstRTT()
          let setRTT = this.$store.state.sequencesettings.get1filertt()
          setRTT = parseFloat(setRTT) === 0 ? originalRTT : setRTT

          return originalRTT / setRTT
      }
  },
  components: {
      SequenceArrow
  }
}
</script>

<style>
#sequencediagram{
    margin-left: 300px;
    margin-top: 100px;
    margin-bottom: 100px;
    width: 1000px;
    overflow: visible;
}
</style>
