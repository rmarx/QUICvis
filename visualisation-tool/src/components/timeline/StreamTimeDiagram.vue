<template>
    <div>
        <svg class="svgcont-trace" v-bind:height="svgheight" v-for="stream in filteredstreams" v-bind:style="{display: displayStream(stream.streamnr), 
        background: bgcolor(stream.cl_init, stream.uni_di)}" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
import StreamBlock from './StreamBlock.vue';
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
        //add svg lane for each stream that is not filtered
        for (let i = 0; i < this.filteredstreams.length; i++){
            let stream = this.filteredstreams[i]
            d3.select(this.$el.children[i]).call(this.zoom)
            streamsvg[stream.streamnr] = this.$el.children[i]
        }
        this.streamframes.forEach((packet, id) => {
            let frameoffset = [];
            packet.frames.forEach((frame) => {
                let streamid = 0
                //if frame has stream id field: get value
                if (frame.hasOwnProperty('stream_id')) {
                    streamid = frame['stream_id']
                }
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
            })
        })
    },
    components: {
        StreamBlock
    },
    methods: {
        displayStream: function(streamid){
            for (let i = 0; i < this.filteredstreams.length; i++) {
                if (this.filteredstreams[i].streamnr === streamid && this.filteredstreams[i].filtered)
                    return 'none';
            }
            return 'block';
        },
        bgcolor(cl_init: boolean, uni_di: boolean) {
            return this.$store.state.vissettings.getStreamColor(cl_init, uni_di);
        }
    }
}
</script>
<style>
.svgcont-trace{
    width: 100%;
    float: left;
    border: 1px solid black;
}
</style>