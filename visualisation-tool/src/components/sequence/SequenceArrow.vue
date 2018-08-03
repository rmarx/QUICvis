<template>
    <g v-if="clientsend"  v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
        <line v-bind:y1="0" v-bind:y2=" (this.rtt_amount / 2) * this.scale" x1="150" x2="850" stroke="lightgreen" stroke-width="2px" 
        />
        <polyline v-bind:points="'830, ' + (((this.rtt_amount / 2) * this.scale) - 10) 
        + ' 850, ' + ((this.rtt_amount / 2) * this.scale) + ' 830, ' + (((this.rtt_amount / 2) * this.scale) + 10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>

        <ArrowInfo :packet_conn1="packet_conn1" />
         <g>
            <line x1="150" x2="130" y1="0" y2="0" stroke="black"/>
            <text x="80" y="0">{{ ( ytranslate / scale ).toFixed(2) }} </text>
         </g>
         <g>
            <line x1="850" x2="870" v-bind:y1="((this.rtt_amount / 2) * this.scale)" v-bind:y2="((this.rtt_amount / 2) * this.scale)" stroke="black"/>
            <text x="875" v-bind:y="((this.rtt_amount / 2) * this.scale)">{{ ((ytranslate + ((this.rtt_amount / 2) * this.scale))/scale).toFixed(2) }} </text>
         </g>
    </g>

    <g v-else v-bind:transform="'translate(0,' + (ytranslate + baseheight) + ')'" @click="putOnForeground">
        <line y1="0" v-bind:y2="(-this.rtt_amount / 2) * this.scale" x1="150" x2="850" stroke="pink" stroke-width="2px" 
         stroke-dasharray="15 3 5 3"/>
        <polyline v-bind:points="'170, ' + (-10) 
        + ' 150, ' + (0) + ' 170, ' + (10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>
         <ArrowInfo :packet_conn1="packet_conn1" />
          <g>
            <line x1="150" x2="130" y1="0" y2="0" stroke="black"/>
            <text x="80" y="0">{{ ( ytranslate / scale ).toFixed(2) }} </text>
         </g>
         <g>
            <line x1="850" x2="870" v-bind:y1="-((this.rtt_amount / 2) * this.scale)" v-bind:y2="-((this.rtt_amount / 2) * this.scale)" stroke="black"/>
            <text x="875" v-bind:y="-((this.rtt_amount / 2) * this.scale)">{{ ((ytranslate - ((this.rtt_amount / 2) * this.scale))/scale).toFixed(2) }} </text>
         </g>
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import ArrowInfo from './ArrowInfo.vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
export default {
    name: "SequenceArrow",
    props: ['packet_conn1', 'baseheight'],
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
            return (parseFloat(this.packet_conn1.connectioninfo.time_delta) * 1000) * this.scale
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
        }
    },
    components: {
        ArrowInfo
    }
}
</script>
