<template>
    <div>
        <svg class="svgcont-trace" v-bind:height="svgheight" v-for="stream in filteredstreams" v-if="!stream.filtered" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
import StreamBlock from './StreamBlock';
export default {
    name: "streamtimediagram",
    props: ['traceid', 'connid'],
    data() {
        return {
            svgheight: 60,
            packetsize: 8
        }
    },
    computed: {
        streamframes(){
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getTimelineStreams()
        },
        zoom() {
            return this.$store.state.timescalestate.getZoom()
        },
        filteredstreams() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getStreamFilters()
        },
    },
    mounted() {
        let compclass = Vue.extend(StreamBlock)
        let streamsvg = []
        let i = 0;
        for (let j = 0; j < this.filteredstreams.length; j++){
            let stream = this.filteredstreams[j]
            if (!stream.filtered) {
                d3.select(this.$el.children[i]).call(this.zoom)
                streamsvg[stream.streamnr] = this.$el.children[i]
                i++;
            }
        }
        this.streamframes.forEach((packet, id) => {
            let frameoffset = [];
            packet.frames.forEach((frame) => {
                let streamid = 0
                if (frame.hasOwnProperty('stream_id')) {
                    streamid = frame['stream_id']
                }
                if (streamid in streamsvg){
                    if (streamid in frameoffset){
                        frameoffset[streamid]++
                    }
                    else
                        frameoffset[streamid] = 0

                    let frameinstance = new compclass({
                        store: this.$store,
                        propsData: {
                            frameinfo: frame,
                            traceid: this.traceid,
                            connid: this.connid,
                            packetid: id,
                            timestamp: packet.timestamp,
                            frameoffset: frameoffset[streamid]
                        }
                    })
                    frameinstance.$mount()
                    streamsvg[streamid].appendChild(frameinstance.$el)
                }
            })
        })
    },
    components: {
        StreamBlock
    }
}
</script>
<style>
.svgcont-trace{
    display: block;
    width: 100%;
    float: left;
    border: 1px solid black;
}
</style>