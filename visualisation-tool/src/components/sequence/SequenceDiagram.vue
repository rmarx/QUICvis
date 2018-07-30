<template>
    <svg id="sequencediagram" v-if="validfiles">
        <SequenceArrow v-for="packet in packets_conn1" :packet_conn1="packet"/>
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
  computed: {
      validfiles() {
          return this.$store.state.sequencesettings.getValidFiles()
      },
      packets_conn1() {
          return this.$store.state.sequencesettings.getPacketsConn1()
      },
      packets_conn2(){

      }
  },
  components: {
      SequenceArrow
  }
}
</script>

<style>
#sequencediagram{
    width: 1000px;
    height: 700px;
    margin-left: 300px;
    margin-top: 100px;
    overflow: visible;
}
</style>
