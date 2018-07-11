<template>
    <div v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px', 'background-color': bgcolor}" class="packetinfo-cont">
        <ul>
            <InfoItem v-for="(info, key) in selectedpacket.packet" :keyname="key" :keyinfolist="info" />
        </ul>
    </div>
</template>

<script lang="ts">
import InfoItem from './InfoItem';
export default {
  name: "packetinfo",
  computed: {
      containerwidth() {
          return window.innerWidth * (1/5)
      },
      containerheight() {
          return window.innerHeight * (3/5)
      },
      selectedpacket(){
          return this.$store.state.vissettings.getSelectedPacket()
      },
      bgcolor(){
          if (this.selectedpacket.packet !== null)
            return this.$store.state.vissettings.getFile(this.selectedpacket.traceid).getConn(this.selectedpacket.connid).getBgColor()
      }
  },
  components: {
      InfoItem
  }
}
</script>
<style>
.packetinfo-cont{
    overflow: auto; 
    position: relative;
    float: left;
}

</style>