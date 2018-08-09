<template>
    <text v-if="texttoshow === 'header'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="showheadername">
        {{ headername}}
    </text>
    <text v-else-if="texttoshow === 'packetnr'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="showpacketnrs">
        {{ packetnr}}
    </text>

    <text v-else-if="texttoshow === 'frame'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="framebgcolor">
        {{ frameName(packet_conn.payloadinfo.framelist[frameid].frametype)}}
    </text>
</template>
<script lang="ts">
import Vue from 'vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import { pack } from 'd3';
export default {
    name: "ArrowInfoSegment",
    props: ['translate', 'framebgcolor', 'texttoshow', 'packet_conn', 'frameid'],
    computed: {
        headername() {
            let packettext = ''
            if (parseInt(this.packet_conn.headerinfo.header_form) === 0) 
                packettext = '1-RTT protect'
            else
                packettext = getLongHeaderName(parseInt(this.packet_conn.headerinfo.long_packet_type))

            if (parseInt(this.packet_conn.size) > 0)
                packettext += '(' + this.packet_conn.size + 'B)'
            return packettext
        },
        packetnr(){
            return 'PN:' + this.packet_conn.headerinfo.packet_number
        },
        showpacketnrs(){
            if (!this.$store.state.sequencesettings.getSeqFilter('packetnrs'))
                return 'transparent'
            else
                return this.framebgcolor
        },
        showheadername(){
            if (!this.$store.state.sequencesettings.getSeqFilter('headername'))
                return 'transparent'
            else
                return this.framebgcolor
        },
        showstreamnrs(){
            return this.$store.state.sequencesettings.getSeqFilter('streamnrs')
        },
    },
    methods: {
        frameName(frametype: string){
            return getFrameName(parseInt(frametype)) + this.getExtraFrameInfo(this.packet_conn.payloadinfo.framelist[this.frameid])
        },
        getExtraFrameInfo(frame){
            let info = ''
            switch (parseInt(frame.frametype)) {
                case 13:
                    if (this.showpacketnrs !== 'transparent')
                        info = ' (' + frame.largest_ack + ')'
                    break;
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                    if (this.showstreamnrs)
                        info = ' (' + frame.stream_id + ')'
                default:
                    break;
            }
            return info
        }
    }
}
</script>