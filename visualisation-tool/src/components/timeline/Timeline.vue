<template>
    <div v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}">
        <div class="w-75 float-left" :style="{overflow: 'auto', height: 'inherit', position: 'relative'}">
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
        <div class="w-25 float-left">
            <PacketInfo />
        </div>
    </div>
</template>

<script lang="ts">
import TimeScale from "./TimeScale";//timescale component
import ConnectionInfoList from "./ConnectionInfoList"//connectionsettings component //connectioninfo component
import ConnectionTimelineList from './ConnectionTimelineList' //connection timeline list component
    //connectiondiagram component
import * as d3 from 'd3';
import PacketInfo from '../conntable/PacketInfo';
export default {
  name: "timeline",
  computed: {
      containerwidth() {
          return window.innerWidth
      },
      containerheight() {
          return window.innerHeight * (3/5)
      },
  },
  components: {
      ConnectionInfoList,
      TimeScale,
      ConnectionTimelineList,
      PacketInfo
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
}

</style>
