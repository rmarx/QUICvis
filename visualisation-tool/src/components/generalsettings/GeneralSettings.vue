<template>
  <div id="generalsettings" class="w-100">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <button id="headingsettings" class="btn btn-link" data-toggle="collapse" data-target="#datasettings" aria-expanded="true" aria-controls="collapseOne">
            View general settings
          </button>
        </h5>
      </div>
      <div id="datasettings" class="collapse" aria-labelledby="headingsettings" data-parent="generalsettings">
        <div class="card-body">
          <FileSettings />
        </div>
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
import FileSettings from './FileSettings'

export default {
  name: "GeneralSettings",
  components: {
    FileSettings
  }
}
</script>

