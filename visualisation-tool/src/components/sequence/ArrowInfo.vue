<template>
    <g transform="translate(300,-10)" v-if="clientsend">

    </g>
    <g transform="translate(300,-10)" v-else>
    
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import ArrowInfoSegment from './ArrowInfoSegment.vue'
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
        showpacketnrs(){
            return this.$store.state.sequencesettings.getSeqFilter('packetnrs')
        },
        showheadername(){
            return this.$store.state.sequencesettings.getSeqFilter('headername')
        },
        showstreamnrs(){
            return this.$store.state.sequencesettings.getSeqFilter('streamnrs')
        }
    },
    methods: {
        framebgcolor(frametype: string){
            return this.$store.state.framecolortables.getFrameColour([frametype])
        }
    },
    mounted() {
        let compclass = Vue.extend(ArrowInfoSegment)
        let translate = 0;

        let packettext = this.headername
        
        if (parseInt(this.packet_conn1.size) > 0)
            packettext += '(' + this.packet_conn1.size + 'B)'
        let packetinstance = new compclass({
            store: this.$store,
            propsData: {
                translate: translate,
                framebgcolor: 'black',
                texttoshow: 'header',
                frameid: -1,
                packet_conn: this.packet_conn1
            }
        })
        packetinstance.$mount()
        this.$el.appendChild(packetinstance.$el)
        translate += packetinstance.$el.clientWidth
        
        packetinstance = new compclass({
            store: this.$store,
            propsData: {
                translate: translate,
                framebgcolor: 'black',
                texttoshow: 'packetnr',
                frameid: -1,
                packet_conn: this.packet_conn1
            }
        })
        packetinstance.$mount()
        this.$el.appendChild(packetinstance.$el)
        translate += packetinstance.$el.clientWidth

        for (let i = 0; i < this.packet_conn1.payloadinfo.framelist.length; i++) {
            let frame = this.packet_conn1.payloadinfo.framelist[i]
                packetinstance = new compclass({
                store: this.$store,
                propsData: {
                    translate: translate,
                    texttoshow: 'frame',
                    frameid: i,
                    framebgcolor: this.framebgcolor(frame.frametype),
                    packet_conn: this.packet_conn1
                }
            })
            packetinstance.$mount()
            this.$el.appendChild(packetinstance.$el)
            translate += packetinstance.$el.clientWidth
        }
    }
}
</script>