<template>
    <div>
        <div v-for="(file, fileindex) in traces">
            <div v-for="(conn) in filteredconns(fileindex)" v-bind:id="'conn-svgdiagram-' + fileindex + conn" class="svgcont-trace" 
            v-bind:style="'background-color: ' + bgcolor(fileindex, conn)">
                <ConnTimeDiagram  v-bind:traceid="fileindex" v-bind:connid="conn" v-if="!showstreams(fileindex, conn)"/>
                <StreamTimeDiagram v-bind:traceid="fileindex" v-bind:connid="conn" v-else/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import ConnTimeDiagram from './ConnTimeDiagram'
import StreamTimeDiagram from './StreamTimeDiagram'
export default {
    name: "connectiontimelinelist",
    computed: {
        traces() {
            return this.$store.state.vissettings.getAllFiles();   
        },
    },
    components: {
        ConnTimeDiagram,
        StreamTimeDiagram
    },
    methods: {
        filteredconns: function(traceid: number) {
            return this.$store.getters.getFilteredConnsInFile(traceid)
        },
        bgcolor: function(traceid: number, connid: number) {
            return this.$store.state.vissettings.getFile(traceid).getConn(connid).getBgColor()
        },
        showstreams: function(traceid: number, connid: number){
            return this.$store.state.vissettings.getFile(traceid).getConn(connid).getShowStreams()
        }
    }
}
</script>
<style>
.svgcont-trace{
    overflow: auto;
}

</style>