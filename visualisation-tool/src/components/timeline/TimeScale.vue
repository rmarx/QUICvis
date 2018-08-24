<template>
    <div>
      <div class="float-left w-100">
        <input type="number" id="startscale" @change="onfieldschange" value="0" v-model="startdom">
        <input type="number" class="text-right" id="endscale" @change="onfieldschange" value="20" min="0">
      </div>
    </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { svg } from "d3";
export default {
  name: "timescale",
  data(){
    return {
      startdom: this.$store.state.timescalestate.getStartDomain(),
      enddom: this.$store.state.timescalestate.getEndDomain(),
    }
  },
  mounted() {
    //display time axis
    let svgcont = d3
      .select("#timelinesvg")
    let width = document.getElementById("timeline")!.clientWidth - 2;
    this.$store.state.timescalestate.setZoom()
    this.updateDimensions(width, 500)
  },
  methods: {
    onfieldschange: function() {
      let startscale = parseInt(
        (<HTMLInputElement>document.getElementById("startscale")).value
      );
      let endscale = parseInt(
        (<HTMLInputElement>document.getElementById("endscale")).value
      );
      if (endscale <= startscale) {
        alert("End of domain needs to be larger than start of domain");
      } else {
        this.updateDomain(startscale, endscale)
      }
    },
    updateDimensions: function(width: number, height: number){
      let data = {
        width: width,
        height: height
      }
      this.$store.dispatch('setTimeScaleRange', data)
    },
    updateDomain: function(start: number, end: number) {
      let data = {
        start: start,
        end: end
      }
      this.$store.dispatch('setTimeScaleDomain', data)
    }
  },
};
</script>

<style>
#startscale {
  width: 60px;
  height: 20px;
  float: left;
}

#endscale {
  width: 60px;
  height: 20px;
  float: right;
}

.timelinecontainer {
  overflow: auto;
  padding-left: 2px;
}
</style>
