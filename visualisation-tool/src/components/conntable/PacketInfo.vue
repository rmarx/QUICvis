<template>
    <div v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}" class="packetinfo-cont">
        {{ selectedpacket }}
    </div>
</template>

<script lang="ts">
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
      }
  },
}
</script>
<style>
.packetinfo-cont{
    overflow: auto; 
    position: relative;
    float: left;
    background-color: yellow;
}

</style>