<template>
  <div>
    <GeneralSettings />
    <SequenceInfo />
    <SequenceDiagram />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralSettings from './generalsettings/GeneralSettings';
import SequenceInfo from './sequence/SequenceInfo';
import SequenceDiagram from './sequence/SequenceDiagram';

@Component({
  components: {
    GeneralSettings,
    SequenceInfo,
    SequenceDiagram
  },
})
export default class AppSequence extends Vue {
  name: 'AppSequence'
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