<template>
</template>

<script lang="ts">
import * as d3 from 'd3';
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

    svgcont.append("g")
      .call(axis)

  }
}
</script>