<template>
    <div class="w-75 timelinecontainer">
        <div class="w-25 timelinecontainer float-left">
            <ConnectionInfoList />
        </div>
        <div class="w-75 timelinecontainer">
            <TimeScale />
            <div id="timeline" class="float-left w-100">
                <svg id="timelinesvg">
                </svg>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import TimeScale from "./TimeScale";//timescale component
import ConnectionInfoList from "./ConnectionInfoList"//connectionsettings component
    //connectioninfo component
//connectionstimeline component
    //connectiondiagram component
import * as d3 from 'd3';
export default {
  name: "timeline",
  components: {
      ConnectionInfoList,
      TimeScale
  },
}
</script>
<style>
.timelinecontainer {
  overflow: auto;
}
#timelinesvg{
  padding-left: 15px;
  overflow: visible !important;
  width: 100%;
  height: 100%;
}
</style>
