<template>
    <div>
        <svg class="svgcont-trace" v-bind:height="svgheight" />
        <svg class="svgcont-trace" v-bind:height="svgheight" />
    </div>
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
            svgheight: 30,
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
        d3.select(this.$el.children[0]).call(this.zoom)
        d3.select(this.$el.children[1]).call(this.zoom)
        
        let uppersvgcont = this.$el.children[0]
        let lowersvgcont = this.$el.children[1]
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
    },
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