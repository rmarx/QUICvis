<template>
  <div>
    <GeneralSettings />
    <Timeline />
    <ConnectionTable />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralSettings from './generalsettings/GeneralSettings';
import Timeline from "./timeline/Timeline";
import ConnectionTable from './conntable/ConnectionTable';

@Component({
  components: {
    GeneralSettings,
    Timeline,
    ConnectionTable
  },
})
export default class AppTimeline extends Vue {
  name: 'AppTimeline'
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