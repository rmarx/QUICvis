<template>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
import PacketBlock from "./PacketBlock"
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
        zoom() {
            return this.$store.state.timescalestate.getZoom()
        }
    },
    mounted() {
        let compclass = Vue.extend(PacketBlock)
        d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight).call(this.zoom)
        d3.select('#conn-svgdiagram-' + this.traceid + this.connid).append("svg")
            .attr("class", "svgcont-trace").attr("height", this.svgheight).call(this.zoom)
        
        let uppersvgcont = document.getElementById('conn-svgdiagram-' + this.traceid + this.connid).children[1]
        let lowersvgcont = document.getElementById('conn-svgdiagram-' + this.traceid + this.connid).children[2]
        this.packets.forEach((packet, id) => {
            if (packet.isclient) {
                let packetinstance = new compclass({
                    store: this.$store,
                    propsData: {
                        packetinfo: packet,
                        traceid: this.traceid,
                        connid: this.connid,
                        packetid: id,
                    }
                })
                packetinstance.$mount()
                uppersvgcont.appendChild(packetinstance.$el)
            }
            else {
                let packetinstance = new compclass({
                    store: this.$store,
                    propsData: {
                        packetinfo: packet,
                        traceid: this.traceid,
                        connid: this.connid,
                        packetid: id,
                    }
                })
                packetinstance.$mount()
                lowersvgcont.appendChild(packetinstance.$el)
            }
        })
    },
    components: {
        PacketBlock
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