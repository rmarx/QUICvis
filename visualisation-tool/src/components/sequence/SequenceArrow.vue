<template>
     <g v-if="clientsend"  v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
        <line v-bind:y1="0" v-bind:y2="y_client" x1="150" x2="850" stroke="lightgreen" stroke-width="2px" 
        />
        <polyline v-bind:points="'830, ' + (y_client - 10) 
        + ' 850, ' + y_client + ' 830, ' + (y_client + 10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>
 
        <ArrowInfo :packet_conn1="packet_conn1" />
         <g>
            <line x1="150" x2="130" y1="0" y2="0" stroke="black"/>
            <text x="80" y="0">{{ ( ytranslate / scale ).toFixed(2) }} </text>
         </g>
         <g>
            <line x1="850" x2="870" v-bind:y1="y_client" v-bind:y2="y_client" stroke="black"/>
            <text x="875" v-bind:y="y_client">{{ ((ytranslate + y_client)/scale).toFixed(2) }} </text>
         </g>
    </g>
 
    <g v-else v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
        <line v-bind:y1="y_client" v-bind:y2="0" x1="150" x2="850" stroke="pink" stroke-width="2px" 
         stroke-dasharray="15 3 5 3"/>
        <polyline v-bind:points="'170, ' + (y_client -10) 
        + ' 150, ' + y_client + ' 170, ' + (y_client + 10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>
         <ArrowInfo :packet_conn1="packet_conn1" />
          <g>
            <line x1="150" x2="130" v-bind:y1="y_client" v-bind:y2="y_client" stroke="black"/>
            <text x="80" v-bind:y="y_client">{{ ((ytranslate / scale ) + y_client/scale).toFixed(2) }} </text>
         </g>
         <g>
            <line x1="850" x2="870" v-bind:y1="0" v-bind:y2="0" stroke="black"/>
            <text x="875" v-bind:y="0">{{ (ytranslate/scale).toFixed(2) }} </text>
         </g>
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
            if (this.packet_conn2 !== null) {
                let t_p1 = parseFloat(this.packet_conn1.connectioninfo.time_delta)
                let t_p2 = parseFloat(this.packet_conn2.connectioninfo.time_delta)

                if (t_p1 < t_p2)
                    return t_p1 * 1000 * this.scale
                else
                    return t_p2 * 1000 * this.scale
            }
            return (parseFloat(this.packet_conn1.connectioninfo.time_delta)* this.rttscale * 1000) * this.scale
        },
        headername() {
            if (parseInt(this.packet_conn1.headerinfo.header_form) === 0) return '1-RTT protect'
            else
                return getLongHeaderName(parseInt(this.packet_conn1.headerinfo.long_packet_type))
        }, 
        y_client(){
            if (this.packet_conn2 !== null) {
                let diff = Math.abs(parseFloat(this.packet_conn1.connectioninfo.time_delta) - parseFloat(this.packet_conn2.connectioninfo.time_delta))
                return diff * this.scale
            }
            else
                return (this.rtt_amount / 2) * this.scale
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
        }
    },
    components: {
        ArrowInfo
    }
}
</script>
