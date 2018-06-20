<template>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
export default {
    name: "conntimediagram",
    props: ['traceid', 'connid'],
    data() {
        return {
            svgheight: 60,
            packetsize: 8
        }
    },
    computed: {
        packets() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getTimelinePackets()
        },
    },
    mounted() {
        let counter = 0;
        let uppersvgcont = d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight)
        let lowersvgcont = d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight)
        this.packets.forEach((packet) => {
            if (packet.isclient) {
                uppersvgcont.append("rect").attr("height", this.packetsize).attr("width", this.packetsize).attr("transform", "translate(" + counter + ", "
                + this.svgheight/2 + ")").attr('fill', this.getFillOfPacket(packet.frametype))
            }
            else {
                lowersvgcont.append("rect").attr("height", this.packetsize).attr("width", this.packetsize).attr("transform", "translate(" + counter + ", "
                + this.svgheight/2 + ")").attr('fill', this.getFillOfPacket(packet.frametype))
            }
            counter += 9
        })
    },
    methods: {
        //TODO: make sure the color updates when it is changed in general settings
        getFillOfPacket(frametype: number){
            return this.$store.state.vissettings.getFrameColour(frametype)
        }
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