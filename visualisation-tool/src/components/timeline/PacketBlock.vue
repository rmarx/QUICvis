<template>
    <rect width="9" height="9" v-bind:fill="fillcolor" v-bind:transform="'translate(' + translateX + ', ' + translateY + ')'"/>
</template>

<script lang="ts">
export default {
  name: "packetblock",
  props: ['packetinfo'],
  data() {
      return {
          translateY: 30
      }
  },
  computed: {
    fillcolor(){
        return this.$store.state.vissettings.getFrameColour(this.packetinfo.frametype)
    },
    translateX() {
        return this.$store.state.timescalestate.calcTranslateX(this.packetinfo.timestamp * 1000)
    }
  },
  methods: {
      selectpacket: function(){

      }
  }
};
</script>

<style>
</style>