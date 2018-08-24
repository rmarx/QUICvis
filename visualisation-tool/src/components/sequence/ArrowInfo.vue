<template>
    <g class="clickable" v-bind:transform="'translate(200,' + (y_coord - 0.8*angle) + ') rotate(' + angle + ')'" v-if="clientsend">

    </g>
    <g class="clickable" v-bind:transform="'translate(200,' + (y_coord - 1.3*angle) + ') rotate(' + -angle + ')'" v-else>
    
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import ArrowInfoSegment from './ArrowInfoSegment.vue'
export default {
    name: "ArrowInfo",
    props: ['packet_conn1', 'y_coord', 'angle'],
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
        },
        addArrowInfo(){
            let compclass = Vue.extend(ArrowInfoSegment)
            let translate = 0;

            //add header name
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
            
            //add packet number
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

            //add all frame names that are contained in the packet
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
    },
    mounted() {
        this.addArrowInfo()
        //when mounted, position names of packet/frames so that they don't overlap
        this.$parent.$on('translatedata', () => {
            let children = (<HTMLElement> this.$el).children
            let translate = 0;

            for (let i = 0; i < children.length; i++) {
                let length = children[i].clientWidth
                
                children[i].setAttribute('transform', 'translate(' + translate + ', 0)')
                translate += length
            }            
        })
    },
    beforeUpdate(){
        //when selecting new file, update packet/frame names
        let children = <HTMLElement> this.$el
        for (let i = 0; i < this.$el.children.length; i++) {
            children.removeChild(this.$el.children[i])
            i--
        }
    },
    updated(){
        this.addArrowInfo()
    }
}
</script>
<style>
.clickable{
    cursor: pointer;
}
</style>
