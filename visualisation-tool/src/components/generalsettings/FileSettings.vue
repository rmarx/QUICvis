<template>
    <div id="filesettings" class="container w-50 float-left">
        <div v-for="(file, fileindex) in traces" class="card card-body w-50">
            <div v-bind:id="file.filename + '-span'">
            <button v-bind:id="file.filename + '-close'" class="btn btn-danger btn-sm">x</button>
            <button class="btn btn-light" type="button" data-toggle="collapse" v-bind:data-target="'#' + file.filename + '-conns'" aria-expanded="false" v-bind:aria-controls="file.filename + '-conns'">
                {{ file.filename}}
            </button>
            <div v-bind:id="file.filename + '-conns'" v-bind:aria-labelledby="file.filename + '-conns'" v-bind:data-parent="file.filename + '-span'">
                <div class="card card-body">
                    <div v-for="(conn, connindex) in file.conns">
                        <input type="checkbox" class="checkbox" v-bind:name="file.filename + '-conn' + connindex" :checked="!conn" @click="filterConn(fileindex, connindex)">
                        {{ 'conn' + (connindex + 1) }}
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export default {
  name: "FileSettings",
  computed:{ 
    traces() {
      return this.$store.getters.getFilesSettings;
  }},
  methods: {
      filterConn(fileindex, connindex){
          let data = {
              fileindex,
              connindex
          }
          this.$store.commit('filterConn', data)
      }
  }
}
</script>