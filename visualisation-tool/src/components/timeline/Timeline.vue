<template>
  <div id="timeline" class="w-75">
      <TimeScale />
  </div>
</template>

<script lang="ts">
import TimeScale from "./TimeScale";//timescale component
//tracetimeline component
    //connectiontimeline component
        //connectionsettings component
        //connectiondiagram component

export default {
  name: "timeline",
  components: {
      TimeScale
  }
}
</script>