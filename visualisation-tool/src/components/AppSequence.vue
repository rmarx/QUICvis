<template>
  <div>
    <GeneralSettings />
    <SequenceInfo />
    <SequenceDiagram />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralSettings from './generalsettings/GeneralSettings.vue';
import SequenceInfo from './sequence/SequenceInfo.vue';
import SequenceDiagram from './sequence/SequenceDiagram.vue';

export default {
  name: 'AppSequence',
  components: {
    GeneralSettings,
    SequenceInfo,
    SequenceDiagram
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