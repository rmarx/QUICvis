<template>
    <div class="w-75 timelinecontainer">
        <div class="w-25 timelinecontainer float-left">
            <ConnectionInfoList />
        </div>
        <div class="w-75 timelinecontainer">
            <TimeScale />
            <div id="timeline">
                <svg id="timelinesvg">
                </svg>
                <ConnectionTimelineList />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import TimeScale from "./TimeScale";//timescale component
import ConnectionInfoList from "./ConnectionInfoList"//connectionsettings component //connectioninfo component
import ConnectionTimelineList from './ConnectionTimelineList' //connection timeline list component
    //connectiondiagram component
import * as d3 from 'd3';
export default {
  name: "timeline",
  components: {
      ConnectionInfoList,
      TimeScale,
      ConnectionTimelineList
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
  height: 1px;
}
</style>
