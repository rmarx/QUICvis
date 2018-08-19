<template>
    <div id="filesettings" class="container w-50 float-left">
        <div v-for="(file, fileindex) in traces" class="container border w-25 float-left">
            <div v-bind:id="file.filename + '-span'">
            <div class="container border">
                {{ file.filename}}
            </div>
            <div v-bind:id="file.filename + '-conns'" v-bind:aria-labelledby="file.filename + '-conns'" v-bind:data-parent="file.filename + '-span'">
                <div class="container border">
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
          this.$store.dispatch('filterConn', data)
      },
      removeFile(fileindex){
          this.$store.dispatch('removeFile', fileindex)
      }
  }
}
</script>