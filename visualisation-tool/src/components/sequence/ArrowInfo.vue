<template>
    <g transform="translate(300,-10)" v-if="clientsend">

    </g>
    <g transform="translate(300,-10)" v-else>
    
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from 'd3';
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import { text } from 'd3';
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
    },
    mounted() {
        let translate = 0;
        let textgroup = d3.select(this.$el)

        let textfield = textgroup.append('text').text(this.headername + '(' + this.packet_conn1.size + 'B)')
        translate += textfield.property('clientWidth')

        textfield = textgroup.append('text')
            .attr('transform', 'translate(' + translate + ', 0)')
            .text('PN:' + this.packet_conn1.headerinfo.packet_number)
        translate += textfield.property('clientWidth')

        for (let i = 0; i < this.packet_conn1.payloadinfo.framelist.length; i++) {
            let frame = this.packet_conn1.payloadinfo.framelist[i]
            let framename = this.frameName(frame.frametype)
            textfield = textgroup.append('text')
                .attr('transform', 'translate(' + translate + ', 0)')
                .attr('fill', this.framebgcolor(frame.frametype))
                .text(framename)
            
            translate += textfield.property('clientWidth')
        }
    }
}
</script>