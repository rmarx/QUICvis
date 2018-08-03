<template>
    <g v-if="clientsend"  v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
        <ArrowInfo :packet_conn1="packet_conn1" />
    </g>

    <g v-else v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
         <ArrowInfo :packet_conn1="packet_conn1" />
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import ArrowInfo from './ArrowInfo.vue'
import * as d3 from 'd3'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import { svg } from 'd3';
export default {
    name: "SequenceArrow",
    props: ['packet_conn1', 'baseheight', 'rttscale', 'packet_conn2'],
    data() {
        return {
            scale: 10,
            framename_translate: 100
        }
    },
    computed: {
        clientsend(){
            return this.$store.state.sequencesettings.isPacketClientSend(this.packet_conn1.headerinfo.dest_connection_id)
        },
        rtt_amount(){
            return this.$store.state.sequencesettings.get1filertt()
        },
        ytranslate(){
            return (parseFloat(this.packet_conn1.connectioninfo.time_delta)* this.rttscale * 1000) * this.scale
        },
        headername() {
            if (parseInt(this.packet_conn1.headerinfo.header_form) === 0) return '1-RTT protect'
            else
                return getLongHeaderName(parseInt(this.packet_conn1.headerinfo.long_packet_type))
        }, 
    },
    methods: {
        frameName(frametype: string){
            return getFrameName(parseInt(frametype))
        },
        framebgcolor(frametype: string){
            return this.$store.state.framecolortables.getFrameColour([frametype])
        },
        putOnForeground(ev: any){
            let el: HTMLElement;
            let svg: HTMLElement
            for (let i = 0; i < ev.path.length; i++) {
                if (i > 0 && ev.path[i].id === 'sequencediagram'){
                    el = ev.path[i - 1]
                    svg = ev.path[i]
                    break;
                }
            }
            el.remove()
            svg.appendChild(el)
        },
        addServerPacket(domel: HTMLElement){
            let svggroup = d3.select(domel)

            svggroup.append('line').attr('y1', this.rtt_amount * this.scale).attr('y2', (this.rtt_amount / 2) * this.scale)
                .attr('x1', 150).attr('x2', 850).attr('stroke', 'pink').attr('stroke-width', '2px').attr('stroke-dasharray', '15 3 5 3')

            svggroup.append('polyline').attr('points', '170, ' + ((this.rtt_amount * this.scale) - 10) 
                + ' 150, ' + (this.rtt_amount * this.scale) + ' 170, ' + ((this.rtt_amount * this.scale) + 10))
                .attr('stroke', 'black').attr('stroke-width', '2px').attr('fill', 'transparent')

            svggroup.append('line').attr('x1', 150).attr('x2', 130).attr('y1', this.rtt_amount * this.scale).attr('y2', this.rtt_amount * this.scale).attr('stroke', 'black')
            svggroup.append('text').attr('x', 80).attr('y', this.rtt_amount * this.scale)
                .text(((this.ytranslate / this.scale ) + (this.rtt_amount * this.scale)/this.scale).toFixed(2))

            svggroup.append('line').attr('x1', 850).attr('x2', 870).attr('y1', (this.rtt_amount / 2) * this.scale).attr('y2', (this.rtt_amount / 2) * this.scale).attr('stroke', 'black')
            svggroup.append('text').attr('x', 875).attr('y', (this.rtt_amount / 2) * this.scale)
                .text(((this.ytranslate + ((this.rtt_amount / 2) * this.scale))/this.scale).toFixed(2))
        },
        addClientPacket(domel: HTMLElement){
            let svggroup = d3.select(domel)

            svggroup.append('line').attr('y1', 0).attr('y2', (this.rtt_amount / 2) * this.scale)
                .attr('x1', 150).attr('x2', 850).attr('stroke', 'lightgreen').attr('stroke-width', '2px')

            svggroup.append('polyline').attr('points', '830, ' + (((this.rtt_amount / 2) * this.scale) - 10) 
                + ' 850, ' + ((this.rtt_amount / 2) * this.scale) + ' 830, ' + (((this.rtt_amount / 2) * this.scale) + 10))
                .attr('stroke', 'black').attr('stroke-width', '2px').attr('fill', 'transparent')

            svggroup.append('line').attr('x1', 150).attr('x2', 130).attr('y1', 0).attr('y2', 0).attr('stroke', 'black')
            svggroup.append('text').attr('x', 80).attr('y', 0).text(( this.ytranslate / this.scale ).toFixed(2))

            svggroup.append('line').attr('x1', 850).attr('x2', 870).attr('y1', (this.rtt_amount / 2) * this.scale).attr('y2', (this.rtt_amount / 2) * this.scale).attr('stroke', 'black')
            svggroup.append('text').attr('x', 875).attr('y', (this.rtt_amount / 2) * this.scale)
                .text(((this.ytranslate + ((this.rtt_amount / 2) * this.scale))/this.scale).toFixed(2))
        }
    },
    mounted() {
        if (this.clientsend)
            this.addClientPacket(this.$el)
        else
            this.addServerPacket(this.$el)
    },
    components: {
        ArrowInfo
    }
}
</script>
