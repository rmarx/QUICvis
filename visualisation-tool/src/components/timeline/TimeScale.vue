<template>
  <div class="w-75 timelinecontainer">
    <div class="float-left col">
      <input type="number" id="startscale" @change="onfieldschange" value="0">
      <input type="number" id="endscale" @change="onfieldschange" value="100" min="0">
    </div>
    <div id="timeline" class="float-left w-100"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { svg } from 'd3';
export default {
  name: "timescale",
  data() {
    return {
      timeaxis: '',
      timescale: '',
      gaxis: '',
      zoom: '',
    }
  },
  mounted() {
    let svgcont = d3.select('#timeline').append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('class', 'col')
    .attr('id','timelinesvg')
    let width = document.getElementById("timeline")!.clientWidth - 30

    this.timescale = d3.scaleLinear().range([0, width]).domain([0,100])
    this.timeaxis = d3.axisBottom(this.timescale)

    this.zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-10,0], [width + 90, 500]])
      .on('zoom', this.zoomed)

    this.gaxis = svgcont.append("g")
      .attr("class", "timeaxis")
      .call(this.timeaxis)
    svgcont.call(this.zoom)
  },
  methods: {
    onfieldschange: function (){
      let startscale = parseInt((<HTMLInputElement> document.getElementById("startscale")).value)
      let endscale = parseInt((<HTMLInputElement> document.getElementById("endscale")).value)
      if (endscale <= startscale) {
        alert("End of domain needs to be larger than start of domain")
      }
      else {
        this.timescale.domain([startscale, endscale])

        d3.select(".timeaxis").call(this.zoom.transform, d3.zoomIdentity).call(this.timeaxis)
      }
    },
    zoomed: function(){
      this.gaxis.call(this.timeaxis.scale(d3.event.transform.rescaleX(this.timescale)))
    }
  }
}
</script>

<style>

#startscale{
  width: 60px;
  height: 20px;
  float: left;
}

#endscale{
  width: 60px;
  height: 20px;
  float: right;
}

.timelinecontainer{
  overflow: auto;
}
</style>
