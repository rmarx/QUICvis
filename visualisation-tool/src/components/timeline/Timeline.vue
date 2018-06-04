<template>
    <div>
        <TimeScale />
    </div>
</template>

<script lang="ts">
import TimeScale from "./TimeScale";//timescale component
//tracetimeline component
    //connectiontimeline component
        //connectionsettings component
        //connectiondiagram component
import * as d3 from 'd3';
export default {
  name: "timeline",
  components: {
      TimeScale
  },
}
</script>