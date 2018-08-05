<template>
  <div id="generalsettings" class="w-100">
    <div class="card">
      <div id="datasettings" class="collapse" aria-labelledby="headingsettings" data-parent="generalsettings">
        <div class="card-body">
          <FileSettings />
          <FColorSettings />
        </div>
      </div>
      <div class="card-header">
        <h5 class="mb-0 float-left">
          <button id="headingsettings" class="btn btn-link" data-toggle="collapse" data-target="#datasettings" aria-expanded="false" aria-controls="datasettings" >
            View general settings
          </button>
        </h5>
      <div class="float-left m-1" v-for="tablename in frametables">
        <button class="btn btn-primary" v-if="tablename === selectedframetable">{{ tablename }}</button>
        <button class="btn btn-secondary" v-else @click="selectFrameTable(tablename)">{{ tablename }}</button>
      </div>
      <router-link  v-if="this.$route.path === '/'" to="/sequence" tag="button" class="btn float-right btn-primary">Sequence Diagram</router-link>
      <router-link  v-else to="/" tag="button" class="btn float-right btn-primary">Timeline</router-link>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PcapParser } from '../..//parser/pcapparser'
import TraceWrapper from '../../data/TraceWrapper';
import axios from 'axios'
import { Ngtcp2LogParser } from '../../parser/Ngtcp2LogParser'
import FileSettings from './FileSettings.vue'
import FColorSettings from './FColorSettings.vue'

export default {
  name: "GeneralSettings",
  computed: {
    frametables(){
      return this.$store.state.framecolortables.getAllTableNames()
    },
    selectedframetable(){
      return this.$store.state.framecolortables.getSelectedTableName()
    }
  },
  methods: {
    selectFrameTable(tablename: string){
      this.$store.dispatch('switchFrameColorTable', tablename);
    },
    test(){
      console.log(document.getElementById('datasettings'))
    }
  },
  components: {
    FileSettings,
    FColorSettings
  }
}
</script>

