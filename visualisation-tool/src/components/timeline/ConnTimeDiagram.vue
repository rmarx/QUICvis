<!-- Connection-level timeline: split between TX and RX lines -->

<template>
    <div>
        <svg class="svgcont-trace send-svg"     v-bind:height="svgheight" />
        <svg class="svgcont-trace receive-svg"  v-bind:height="svgheight" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
import PacketBlock from "./PacketBlock.vue"
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
        }
    },
    mounted() {

        let compclass = Vue.extend(PacketBlock);
        
        d3.select(this.$el.children[0]).call(this.$store.state.timescalestate.getZoom()).on("wheel", function() { d3.event.preventDefault(); });
        d3.select(this.$el.children[1]).call(this.$store.state.timescalestate.getZoom()).on("wheel", function() { d3.event.preventDefault(); });
        
        //svg lane for sent packets
        let uppersvgcont = this.$el.children[0];
        //svg lane for received packets
        let lowersvgcont = this.$el.children[1];


        this.$store.state.timescalestate.addZoomable( uppersvgcont );
        this.$store.state.timescalestate.addZoomable( lowersvgcont );

        let largestTimestamp:number = 0;

        this.packets.forEach((packet, id) => {

            let packetinstance = new compclass({
                store: this.$store,
                propsData: {
                    packetinfo: packet,
                    traceid: this.traceid,
                    connid: this.connid,
                    packetid: id
                }
            })
            packetinstance.$mount();

            //if packet is send by TX
            if (packet.isclient) {
                uppersvgcont.appendChild(packetinstance.$el);
            }
            //if packet is sent by RX
            else {
                lowersvgcont.appendChild(packetinstance.$el);
            }

            this.$store.state.timescalestate.addMovableOnZoom( packetinstance );

            if( packet.timestamp > largestTimestamp )
                largestTimestamp = packet.timestamp;
        });

        let currentDomainEnd:number = this.$store.state.timescalestate.getEndDomain();
        largestTimestamp = Math.max(largestTimestamp, 10100); // 10.1s is the default
        if( largestTimestamp > currentDomainEnd )
            this.$store.state.timescalestate.setDomain( this.$store.state.timescalestate.getStartDomain(), largestTimestamp );

        this.$store.state.timescalestate.forceMovableSync();
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

.receive-svg{
    background:rgba(255,0,0,0.2);
}

.send-svg{
    background:rgba(0,128,0,0.2);
}

</style>