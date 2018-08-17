<template>
    <div v-if="validfiles" id="seq-diagramcontainer">
        <svg id="sequencediagram" v-if="validfiles" v-bind:height="getLargestTime + 'px'">
            <line x1="150" y1="-100" x2="150" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
            <line x1="850" y1="-100" x2="850" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
            <SequenceArrow v-for="(packets, index) in sequencepackets" :packet_conn1="packets.packet_conn1" 
            :packet_conn2="packets.packet_conn2" :baseheight="(index * margin)" :start_time="packets.start_time"/>
        </svg>
        <div v-for="(packets, index) in sequencepackets">
        <ServerInfo  :packet_conn="packets.packet_conn1" :baseheight="(index * margin)" :start_time="packets.start_time" 
            :isclient="true" :_2filesused="false"/>
        <ServerInfo :packet_conn="packets.packet_conn2" :baseheight="(index * margin)" :start_time="packets.start_time" 
            :isclient="false" :_2filesused="true"/>
        </div>
    </div>
    <div id="nodiagram" v-else>
        Current file selection is invalid
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import SequenceArrow from './SequenceArrow.vue'
import ServerInfo from './ServerInfo.vue';
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
  },
  components: {
      SequenceArrow,
      ServerInfo
  }
}
</script>

<style>
#sequencediagram{
    width: 1000px;
    overflow: visible;
}

#seq-diagramcontainer{
    margin-left: 300px;
    margin-top: 100px;
    margin-bottom: 100px;
    width: 1300px;
    position: relative;
}

#nodiagram{
    margin-left: 300px;
    margin-top: 1px;
}
</style>
