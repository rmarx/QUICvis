
<!-- The actual timeline renderer with packets/frames and RX/TX lines --> 

<template>
    <div>
        <div v-for="(file, fileindex) in traces" v-bind:key="fileindex">
            <div v-for="(conn) in filteredconns(fileindex)" v-bind:key="conn.connid" v-bind:id="'conn-svgdiagram-' + fileindex + conn" class="svgcont-trace">
                <ConnTimeDiagram  v-bind:traceid="fileindex" v-bind:connid="conn"/>
                <StreamTimeDiagram v-bind:traceid="fileindex" v-bind:connid="conn" v-if="showstreams(fileindex, conn)"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ConnTimeDiagram from './ConnTimeDiagram.vue'
import StreamTimeDiagram from './StreamTimeDiagram.vue'
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