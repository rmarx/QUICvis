<template>
    <rect width="9" height="9" v-bind:fill="fillcolor" v-bind:transform="'translate(' + translateX + ', ' + translateY + ')'" @click="selectpacket()" 
    stroke="black" v-bind:stroke-width="strokewidth"/>
</template>

<script lang="ts">
export default {
  name: "packetblock",
  props: ['frameinfo', 'traceid', 'connid', 'packetid', 'timestamp', 'frameoffset'],
  data() {
      return {
          transamount: 10,
          baseTranslateY: 2
      }
  },
  computed: {
    fillcolor(){
        return this.$store.state.framecolortables.getFrameColour(this.frameinfo.frametype)
    },
    translateX() {
        return this.$store.state.timescalestate.calcTranslateX((this.timestamp * 1000) + parseInt(this.xoffset))
    },
    strokewidth(){
        if (this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).isPacketSelected(this.packetid))
            return 2
        else
            return 0
    },
    translateY(){
        return (this.frameoffset % 5)  * this.transamount
    },
    xoffset(){
        return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getXOffset()
    }
  },
  methods: {
    selectpacket: function(){
        let data = {
            traceid: this.traceid, 
            connid: this.connid, 
            packetid: this.packetid
        }
        this.$store.dispatch('setSelectedPacket', data)
    }
  }
};
</script>

<style>
</style>