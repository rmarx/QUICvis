<template>
    <div v-bind:style="{height: containerheight + 'px', 'background-color': bgcolor}" class="packetinfo-cont">
        <ul>
            <InfoItem v-for="(info, key) in selectedpacket.packet" :keyname="key" :keyinfolist="info" :collapse="showChildren(key)" v-if="key !== 'size'"/>
        </ul>
    </div>
</template>

<script lang="ts">
import InfoItem from './InfoItem.vue';
export default {
  name: "packetinfo",
  computed: {
      containerwidth() {
          return window.innerWidth * (1/6)
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
  },
  methods: {
      showChildren(name: string){
          if (name === 'connectioninfo')
            return false
          else
            return true
      }
  }
}
</script>
<style>
.packetinfo-cont{
    overflow: auto; 
    position: relative;
    margin-left: 5px;
}

</style>