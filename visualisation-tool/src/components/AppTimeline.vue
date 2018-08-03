<template>
  <div>
    <GeneralSettings />
    <Timeline />
    <ConnectionTable />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralSettings from './generalsettings/GeneralSettings.vue';
import Timeline from "./timeline/Timeline.vue";
import ConnectionTable from './conntable/ConnectionTable.vue';

export default {
  name: 'AppTimeline',
  components: {
    GeneralSettings,
    Timeline,
    ConnectionTable
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>