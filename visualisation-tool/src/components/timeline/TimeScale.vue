<template>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { svg } from 'd3';
export default {
  name: "timescale",
  mounted() {
    let svgcont = d3.select('#timeline').append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'pl-2')
    let width = document.getElementById("timeline")!.clientWidth

    let xscale = d3.scaleLinear().range([0, width]).domain([0,100])
    let axis = d3.axisBottom(xscale)

    let zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [width + 90, 500]])
      .on('zoom', zoomed)

    let gx = svgcont.append("g")
      .call(axis)
    svgcont.call(zoom)

    function zoomed () {
      gx.call(axis.scale(d3.event.transform.rescaleX(xscale)))
    }
  }
}
</script>