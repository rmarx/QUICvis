<template>
    <div v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px', overflow: 'auto', position: 'relative', float: 'left'}">
        <div class="conninfocontainer float-left">
            <ConnectionInfoList />
        </div>
        <div class="timelinecontainer">
            <TimeScale />
            <div id="timeline">
                <svg id="timelinesvg" class="pt-3">
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
  computed: {
      containerwidth() {
          return window.innerWidth * (4/5)
      },
      containerheight() {
          return window.innerHeight * (3/5)
      },
  },
  components: {
      ConnectionInfoList,
      TimeScale,
      ConnectionTimelineList
  },
}
</script>
<style>
.conninfocontainer {
  width: 90px;
  margin-top: 44px;
  overflow: hidden !important;
}

.timelinecontainer {
    overflow: auto;
}
#timelinesvg{
  overflow: visible !important;
  width: 100%;
  height: 1px;
  padding-left: 3px; 
}

</style>
