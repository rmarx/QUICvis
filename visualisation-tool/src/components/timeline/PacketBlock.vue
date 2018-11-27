<template>
    <rect width="9" height="9" v-bind:fill="fillcolor" transform="translate(0, 10)" @click="selectpacket()" 
    stroke="black" v-bind:stroke-width="strokewidth"/>
</template>

<script lang="ts">
export default {
  name: "packetblock",
  props: ['packetinfo', 'traceid', 'connid', 'packetid'],
  data() {
      return {
          translateY: 10
      }
  },
  computed: {
    fillcolor(){
        return this.$store.state.framecolortables.getFrameColour(this.packetinfo.frametype)
    },
    strokewidth(){
        if (this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).isPacketSelected(this.packetid))
            return 2;
        else
            return 0;
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
        this.$store.dispatch('setSelectedPacket', data);
    },

    // called by TimeScaleState directly when it knows we need to update
    // using computed properties based on this.$store was too slow with this large an anmount of PacketBlocks
    updateXAfterZoom(xScaleFunction:any){
        let x = xScaleFunction( (this.packetinfo.timestamp * 1000) + parseInt(this.xoffset) );
        this.$el.transform.baseVal.getItem(0).setTranslate(x,this.translateY);
    }
  }
};
</script>

<style>
</style>