<template>
    <text v-if="showheadername && texttoshow === 'header'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="framebgcolor">
        {{ headername}}
    </text>
    <text v-else-if="showpacketnrs && texttoshow === 'packetnr'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="framebgcolor">
        {{ packetnr}}
    </text>

    <text v-else-if="texttoshow === 'frame'" v-bind:transform="'translate(' + translate + ', 0)'" v-bind:fill="framebgcolor">
        {{ frameName(packet_conn.payloadinfo.framelist[frameid].frametype)}}
    </text>
</template>
<script lang="ts">
import Vue from 'vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
export default {
    name: "ArrowInfoSegment",
    props: ['translate', 'framebgcolor', 'texttoshow', 'packet_conn', 'frameid'],
    computed: {
        headername() {
            if (parseInt(this.packet_conn.headerinfo.header_form) === 0) return '1-RTT protect'
            else
                return getLongHeaderName(parseInt(this.packet_conn.headerinfo.long_packet_type))
        },
        packetnr(){
            return 'PN:' + this.packet_conn.headerinfo.packet_number
        },
        showpacketnrs(){
            return this.$store.state.sequencesettings.getSeqFilter('packetnrs')
        },
        showheadername(){
            return this.$store.state.sequencesettings.getSeqFilter('headername')
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
                    if (this.showpacketnrs)
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