<template>
    <g transform="translate(200,-10)" v-if="clientsend">
        <text v-bind:textLength="(headername.length * 9 + 24)">{{ headername + '(' + packet_conn1.size + 'b)' }}</text>
        <text v-for="(frame, index) in packet_conn1.payloadinfo.framelist" v-bind:transform="'translate(' + (framename_translate + index * 70) + ', 0)'" 
        v-bind:fill="framebgcolor(frame.frametype)" v-bind:textLength="(frameName(frame.frametype).length * 9)">
            {{ frameName(frame.frametype) }}
        </text>
    </g>
    <g transform="translate(500,-10)" v-else>
        <text v-bind:textLength="(headername.length * 9 + 24)">{{ headername + '(' + packet_conn1.size + 'b)' }}</text>
        <text v-for="(frame, index) in packet_conn1.payloadinfo.framelist" v-bind:transform="'translate(' + (framename_translate + index * 70) + ', 0)'" 
        v-bind:fill="framebgcolor(frame.frametype)" v-bind:textLength="(frameName(frame.frametype).length * 9)">
            {{ frameName(frame.frametype) }}
        </text>
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
export default {
    name: "ArrowInfo",
    props: ['packet_conn1'],
    data() {
        return {
            framename_translate: 0
        }
    },
    computed: {
        clientsend(){
            return this.$store.state.sequencesettings.isPacketClientSend(this.packet_conn1.headerinfo.dest_connection_id)
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
        getTextTranslate(amount: number){
            
        }
    }
}
</script>