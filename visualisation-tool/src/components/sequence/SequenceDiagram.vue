<template>
    <div v-if="validfiles" id="seq-diagramcontainer">
        <!--<svg id="sequencediagram" v-if="validfiles" v-bind:height="getLargestTime + 'px'">
            <line x1="150" y1="-100" x2="150" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
            <line x1="850" y1="-100" x2="850" v-bind:y2="(getLargestTime + 100)"  stroke="black"/>
            <SequenceArrow v-for="(packets, index) in sequencepackets" :packet_conn1="packets.packet_conn1" 
            :packet_conn2="packets.packet_conn2" :baseheight="(index * margin)" :start_time="packets.start_time" :using2files="using2files"/>
        </svg>
        <div v-for="(packets, index) in sequencepackets">
        <ServerInfo  :packet_conn="packets.packet_conn1" :baseheight="(index * margin)" :start_time="packets.start_time" 
            :isclient="true" :_2filesused="false"/>
        <ServerInfo :packet_conn="packets.packet_conn2" :baseheight="(index * margin)" :start_time="packets.start_time" 
            :isclient="false" :_2filesused="true"/>
        </div>-->
        <div hidden>{{ rtt_amount + scale }}</div>
    </div>
    <div id="nodiagram" v-else>
        Current file selection is invalid
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import SequenceArrow from './SequenceArrow.vue'
import ServerInfo from './ServerInfo.vue';
import { QuicPacket } from '../../data/quic';
import * as d3 from 'd3';

export interface SequenceGroup{
    send_coord: number
    send_time: number
    receive_coord: number
    receive_time: number
    packet_info: QuicPacket
    packet_number: number
}
export default {
  name: "SequenceDiagram",
  data() {
      return {
          margin: 50
      }
  },
  computed: {
      scale() {
          return this.$store.state.sequencesettings.getTimeScale()
      },
      validfiles() {
          return this.$store.state.sequencesettings.getValidFiles()
      },
      sequencepackets() {
          return this.$store.state.sequencesettings.getPackets()
      },
      getLargestTime(){
          return ((this.$store.state.sequencesettings.getLargestTime() * 1000 * 10) + (this.sequencepackets.length * this.margin)) *2
      },
      using2files(){
          return this.$store.state.sequencesettings.isUsing2Files()
      },
      sequencePackets1(){
          return this.$store.state.sequencesettings.getPacketsTrace1()
      },
      sequencePackets2(){
          return this.$store.state.sequencesettings.getPacketsTrace2()
      },
      rtt_amount(){
            return this.$store.state.sequencesettings.get1filertt()
        },
  },
  components: {
      SequenceArrow,
      ServerInfo
  },
  mounted() {
      this.calcArrowCoords()
  },
  methods: {
    calcArrowCoords(){
        if (this.validfiles){
            let packets1 = this.sequencePackets1
            let packets2: Array<QuicPacket>
            if (this.using2files) {
                packets2 = this.addDelayForServer(this.sequencePackets2)
            }
            else
                packets2 = this.addDelayForServer(this.sequencePackets1)

            let sequencepackets = new Array<SequenceGroup>()

            let i = 0;
            let j = 0;

            let basemargin = 0

            while ( i < packets1.length || j < packets2.length){
                if (i < packets1.length && ((j < packets2.length && packets1[i].connectioninfo.time_delta <= packets2[j].connectioninfo.time_delta) 
                    || (j >= packets2.length)))  {
                    let originalcoord = packets1[i].connectioninfo.time_delta * 1000 * this.scale
                    let diff = originalcoord - basemargin

                    if ((i > 0|| j > 0) && diff < 45){
                        originalcoord = basemargin + 45
                    }
                    basemargin = originalcoord
                    let s_index = sequencepackets.findIndex(x => x.packet_number === packets1[i].headerinfo.packet_number)
                    if (s_index > -1) {
                        sequencepackets[s_index].receive_coord = originalcoord 
                        sequencepackets[s_index].receive_time = packets1[i].connectioninfo.time_delta * 1000
                    }
                    else {
                        sequencepackets.push({
                            send_coord: originalcoord, 
                            send_time: packets1[i].connectioninfo.time_delta * 1000,
                            receive_coord: -1, 
                            receive_time: -1,
                            packet_info: packets1[i],
                            packet_number: packets1[i].headerinfo.packet_number
                        })
                    }
                    i++
                }
                else 
                    if ( j < packets2.length ){
                        let originalcoord = packets2[j].connectioninfo.time_delta * 1000 * this.scale
                        let diff = originalcoord - basemargin

                        if ((i > 0|| j > 0) && diff < 45){
                            originalcoord = basemargin + 45
                        }
                        basemargin = originalcoord

                        let s_index = sequencepackets.findIndex(x => x.packet_number === packets2[j].headerinfo.packet_number)
                        if (s_index > -1) {
                            sequencepackets[s_index].receive_coord = originalcoord
                            sequencepackets[s_index].receive_time = packets2[j].connectioninfo.time_delta * 1000

                        }
                        else {
                            sequencepackets.push({
                                send_coord: originalcoord,
                                send_time: packets2[j].connectioninfo.time_delta * 1000,
                                receive_coord: -1, 
                                receive_time: -1,
                                packet_info: packets2[j],
                                packet_number: packets2[j].headerinfo.packet_number
                            })
                        }
                        j++
                    }
            }
            this.drawArrows(sequencepackets)
        }
    },
    addDelayForServer(packets){
        let old_delay = 0 - packets[0].connectioninfo.time_delta
        for (let i = 0; i < packets.length; i++) {
            packets[i].connectioninfo.time_delta += old_delay
            packets[i].connectioninfo.time_delta += (this.rtt_amount / 2 / 1000)
        }
        return packets
    },
    drawArrows(sequencepackets: Array<SequenceGroup>){
        let compclass = Vue.extend(SequenceArrow)

        let largestcoord = sequencepackets[sequencepackets.length - 1].send_coord > -1 ? sequencepackets[sequencepackets.length - 1].send_coord 
            : sequencepackets[sequencepackets.length - 1].receive_coord

        let container = d3.select(this.$el).append('svg')
            .attr('id', 'sequencediagram')
            .attr('height', largestcoord + 'px')
        
        container.append('line').attr('x1', '150').attr('x2', '150').attr('y1', '-100').attr('y2', largestcoord + 100).attr('stroke', 'black')
        container.append('line').attr('x1', '850').attr('x2', '850').attr('y1', '-100').attr('y2', largestcoord + 100).attr('stroke', 'black')

        for (let i = 0; i < sequencepackets.length; i++) {
            let packetinstance = new compclass({
                store: this.$store,
                propsData: {
                    packet_conn: sequencepackets[i].packet_info,
                    send_coord: sequencepackets[i].send_coord,
                    send_time: sequencepackets[i].send_time,
                    receive_coord: sequencepackets[i].receive_coord,
                    receive_time: sequencepackets[i].receive_time
                }
            })
            packetinstance.$mount()
            this.$el.children[0].appendChild(packetinstance.$el)
            packetinstance.$emit('translatedata')
        }
    },
    removeCurrentDiagram(){
        let children = <HTMLElement> this.$el
        for (let i = 0; i < this.$el.children.length; i++) {
            children.removeChild(this.$el.children[i])
            i--
        }
    }
  },
  beforeUpdate(){
      this.removeCurrentDiagram()
      this.calcArrowCoords()
      /*
      console.log('updating')
      console.log(this.sequencepackets)
      let container = <HTMLElement> this.$el
      if (container.id !== "nodiagram"){
        let svgcontainer = container.children[0]
        let arrows = svgcontainer.children
        let lasttime = 0
        let extratranslate = 0
        let diff = 0
        for (let i = 2; i < arrows.length; i++) {
            let transform = arrows[i].getAttribute('transform')
            let splittf = transform.split(',')
            let tf_y = parseFloat(splittf[1].slice(0,-1))
            
            diff = tf_y - lasttime
            if( i > 2 &&  diff < 40 ){
                extratranslate = lasttime + 40;
                tf_y = extratranslate
            }
            lasttime = tf_y
            arrows[i].setAttribute('transform', splittf[0] + ',' + tf_y + ')')
        }
    }*/
  },
}
</script>

<style>
#sequencediagram{
    width: 1000px;
    overflow: visible;
}

#seq-diagramcontainer{
    margin-left: 300px;
    margin-top: 100px;
    margin-bottom: 100px;
    width: 1300px;
    position: relative;
}

#nodiagram{
    margin-left: 300px;
    margin-top: 1px;
}
</style>
