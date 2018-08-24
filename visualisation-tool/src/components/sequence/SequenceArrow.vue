<template>
    <!-- show if packet is send from client -->
     <g v-if="clientsend"  v-bind:transform="'translate(0,' + (send_coord) + ')'" @click="putOnForeground">
        <line v-bind:y1="0" v-bind:y2="(y_receive)" x1="150" x2="850" stroke="lightgreen" stroke-width="2px" 
        />
        <polyline v-bind:points="'830, ' + (y_receive - 10) 
        + ' 850, ' + y_receive + ' 830, ' + (y_receive + 10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>

        <!-- component containing text of header/frame name -->
        <ArrowInfo :packet_conn1="packet_conn" :angle="angle" :y_coord="centerpoint_text"/>
        
        <!-- timestamp from client's log -->
         <g v-if="showtimestamps">
            <line x1="150" x2="130" y1="0" y2="0" stroke="black"/>
            <text x="80" y="0">{{ send_time.toFixed(2) }} </text>
         </g>

         <!-- timestamp from server's log -->
         <g v-if="showtimestamps">
            <line x1="850" x2="870" v-bind:y1="y_receive" v-bind:y2="y_receive" stroke="black"/>
            <text x="875" v-bind:y="y_receive">{{ receivedelta }} </text>
         </g>
    </g>
    <!-- show if packet is send from server -->
    <g v-else v-bind:transform="'translate(0,' + (send_coord) + ')'" @click="putOnForeground">
        <line v-bind:y1="y_receive" v-bind:y2="0" x1="150" x2="850" stroke="pink" stroke-width="2px" 
         stroke-dasharray="15 3 5 3"/>
        <polyline v-bind:points="'170, ' + (y_receive -10) 
        + ' 150, ' + y_receive + ' 170, ' + (y_receive + 10)"
         stroke="black"  stroke-width="2px" fill="transparent"/>
         <ArrowInfo :packet_conn1="packet_conn" :angle="angle" :y_coord="centerpoint_text"/>
          <g v-if="showtimestamps">
            <line x1="150" x2="130" v-bind:y1="y_receive" v-bind:y2="y_receive" stroke="black"/>
            <text x="80" v-bind:y="y_receive">{{ receivedelta }} </text>
         </g>
         <g v-if="showtimestamps">
            <line x1="850" x2="870" v-bind:y1="0" v-bind:y2="0" stroke="black"/>
            <text x="875" v-bind:y="0">{{ send_time.toFixed(2) }} </text>
         </g>
    </g>
</template>
<script lang="ts">
import Vue from 'vue'
import ArrowInfo from './ArrowInfo.vue'
import * as d3 from 'd3'
import { getLongHeaderName, getFrameName } from '../../data/QuicNames'
import { svg, interpolateBrBG } from 'd3';
export default {
    name: "SequenceArrow",
    props: ['packet_conn', 'send_coord', 'send_time', 'receive_coord', 'receive_time'],
    data() {
        return {
            framename_translate: 100
        }
    },
    computed: {
        clientsend(){
            return this.$store.state.sequencesettings.isPacketClientSend(this.packet_conn.headerinfo.dest_connection_id)
        },
        headername() {
            if (parseInt(this.packet_conn.headerinfo.header_form) === 0) return '1-RTT protect'
            else
                return getLongHeaderName(parseInt(this.packet_conn.headerinfo.long_packet_type))
        }, 
        y_receive(){
            if (this.receive_coord > -1)
                return this.receive_coord - this.send_coord
            else
                return 0
        },
        receivedelta(){
            if (this.receive_time > -1)
                return this.receive_time.toFixed(2)
            else
                return 'xx.xx'
        },
        angle(){
            let opp = 700
            let adj = this.y_receive

            let angle = Math.atan(opp/adj) * 180 / Math.PI
            return 90 - angle
        },
        centerpoint_text(){
            if (this.clientsend)
                return this.y_receive * 0.1
            else
                return this.y_receive
        },
        showtimestamps(){
            return this.$store.state.sequencesettings.getSeqFilter('timestamps')
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
            let svg: HTMLElement;
            for (let i = 0; i < ev.path.length; i++) {
                if (i > 0 && ev.path[i].id === 'sequencediagram'){
                    el = ev.path[i - 1]
                    svg = ev.path[i]
                    break;
                }
            }
            this.addHighlightBox(svg, el)
            el.remove()
            svg.appendChild(el)
        },
        addHighlightBox(svg: HTMLElement, el: HTMLElement){
            let box = document.getElementById('arrow-background-box')
            if (box)
                box.remove()

            let svgd3 = d3.select(el)
            let x = parseFloat(el.children[0].getAttribute('x1')) + 2
            let y = 0

            let width = parseFloat(el.children[0].getAttribute('x2')) - x - 2
            //get highest y coord for drawing bounding box
            let height = parseFloat(el.children[0].getAttribute('y2')) > 0 ? parseFloat(el.children[0].getAttribute('y2')) : parseFloat(el.children[0].getAttribute('y1'))

            if (height === 0) {
                y = -20
                height = 20
            }

            svgd3.append('rect').attr('id', 'arrow-background-box').attr('x', x).attr('y', y)
                .attr('width', width).attr('height', height).attr('fill', 'white').on('dblclick', this.removeHighlightBox)

            //position all elements of the packet in front of white box
            for (let i = 0; i < el.children.length - 1; i++) {
                let child = el.children[0]
                child.remove()
                el.appendChild(child)
                
            }
        },
        removeHighlightBox(){
            let box = document.getElementById('arrow-background-box')
            if (box)
                box.remove()
        }
    },
    components: {
        ArrowInfo
    }
}
</script>
