<!-- Top-level container for the whole time-line visualization -->

<template>
    <div v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}">
        <div class="w-75 float-left" :style="{overflow: 'auto', height: 'inherit', position: 'relative'}">
            <!-- left row with names of traces, connections and streams -->
            <div class="conninfocontainer float-left">
                <TraceInfoList />
            </div>
            <!-- the actual timeline --> 
            <div class="timelinecontainer">
                <!-- x-axis controls on top (2 input fields, FROM and TO time) --> 
                <TimeScale />
                <div id="timeline">
                    <!-- the x-axis SVG on top --> 
                    <svg id="timelinesvg" class="pt-3"></svg>

                    <!-- The actual timeline svgs (rects for packets/frames, RX and TX lanes, etc.) --> 
                    <ConnectionTimelineList />
                </div>
            </div>
        </div>
        <div class="w-25 float-left">
            <!-- Detailed packet info on the currently selected packet (if any) --> 
            <PacketInfo />
        </div>
    </div>
</template> 

<script lang="ts">
import TimeScale from "./TimeScale.vue";//timescale component
import TraceInfoList from "./TraceInfoList.vue"//connectionsettings component //connectioninfo component
import ConnectionTimelineList from './ConnectionTimelineList.vue' //connection timeline list component
    //connectiondiagram component
import * as d3 from 'd3';
import PacketInfo from '../conntable/PacketInfo.vue';
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
      TraceInfoList,
      TimeScale,
      ConnectionTimelineList,
      PacketInfo
  },
}
</script>
<style>
.conninfocontainer {
  width: 180px;
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
