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
            svgheight: 60
        }
    },
    computed: {
        packets() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getTimelinePackets()
        },
        bgcolor() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getBgColor()
        }
    },
    mounted() {
        let counter = 0;
        let uppersvgcont = d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight).attr("style", "background-color: " + this.bgcolor + " ;")
        let lowersvgcont = d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight).attr("style", "background-color: " + this.bgcolor + " ;")
        this.packets.forEach((packet) => {
            if (packet.isclient) {
                uppersvgcont.append("rect").attr("height", "5").attr("width", "5").attr("transform", "translate(" + counter + ", "
                + this.svgheight/2 + ")")
            }
            else {
                lowersvgcont.append("rect").attr("height", "5").attr("width", "5").attr("transform", "translate(" + counter + ", "
                + this.svgheight/2 + ")")
            }
            counter += 6
        })
    },
}
</script>
<style>
.svgcont-trace{
    display: block;
    width: 100%;
    float: left;
}
</style>