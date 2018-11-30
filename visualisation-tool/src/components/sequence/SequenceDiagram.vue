<template>
    <div v-if="validfiles" id="seq-diagramcontainer">
        <div hidden>{{ userRTT + scale }}</div>
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
    packet_info1: QuicPacket|null
    packet_info2: QuicPacket|null
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
      //check if a file is selected or if 2 files are selected: that they both are about the same connection
      validfiles() {
          return this.$store.state.sequencesettings.getValidFiles()
      },
      sequencepackets() {
          return this.$store.state.sequencesettings.getPackets()
      },
      getLargestTime(){
          return ((this.$store.state.sequencesettings.getLargestTime() * 1000 * 10) + (this.sequencepackets.length * this.margin)) *2
      },
      //check if 2 files are selected
      using2files(){
          return this.$store.state.sequencesettings.isUsing2Files()
      },
      //get packets of endpoint1
      sequencePackets1(){
          return this.$store.state.sequencesettings.getPacketsTrace1()
      },
      //get packets of endpoint2
      sequencePackets2(){
          return this.$store.state.sequencesettings.getPacketsTrace2()
      },
      userRTT(){
            return this.$store.state.sequencesettings.get1filertt()
      },
      calculatedRTT(){
          return this.$store.state.sequencesettings.getFirstRTT()
      }
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
        if( !this.validfiles )
            return;

        let packetsClient = this.sequencePackets1;
        let packetsServer = undefined;

            //if 2 files are selected: get packets of second file
            if (this.using2files) {
                packetsServer = this.addDelayForServer(this.sequencePackets2, true)
            }
            //if 1 file is selected: get a copy of the packets from file 1
            else
                packetsServer = this.addDelayForServer(this.sequencePackets1, false)


        let sequencepackets = new Array<SequenceGroup>()
        let pncache = new Map<number, number>(); 

        let i = 0;
        let j = 0;
        let basemargin = 0;

        // we need to deal with duplicate packet numbers somehow
        // we just keep a list and if we encounter them again, give them a new packet number on both sides
        // TODO: current algorithm is relatively stupid, as it doesn't take into account re-orders
        // -> To deal with re-orders, we would need to check packet contents. If those are also the same, there is no way to detect re-orders
        for( let packet of packetsClient ){
            let pn  = packet.headerinfo.packet_number;
            if( pncache.has(pn) ){
                let pnOccurenceCount = pncache.get(pn);
                // we assume there won't be 10000 more packets in the trace
                // TODO: handle this more cleanly
                let newpn = pn + 10000 + pnOccurenceCount; 

                console.log("Found duplicate client-side packet ", pn, pnOccurenceCount, newpn);
                packet.headerinfo.packet_number = newpn;
                packet.headerinfo.original_packet_number = pn;

                pncache.set( pn, pnOccurenceCount + 1);
                pncache.set( newpn, 1);
            }
            else
                pncache.set( pn, 1 );
        }

        pncache.clear();
        for( let packetWrap of packetsServer ){
            let pn  = packetWrap.packet.headerinfo.packet_number;
            if( pncache.has(pn) ){
                let pnOccurenceCount = pncache.get(pn);
                // we assume there won't be 10000 more packets in the trace
                // TODO: handle this more cleanly
                let newpn = pn + 10000 + pnOccurenceCount; 

                console.log("Found duplicate server-side packet ", pn, pnOccurenceCount, newpn);
                packetWrap.packet.headerinfo.packet_number = newpn;
                packetWrap.packet.headerinfo.original_packet_number = pn;

                pncache.set( pn, pnOccurenceCount + 1);
                pncache.set( newpn, 1);
            }
            else
                pncache.set( pn, 1 );
        }



        // Both packet lists contain both SENT and RECEIVED packets
        // we don't always easily know which are the outgoing and incoming packets
        // for example, for client/server logs it might be clear, but in pcaps 
        // we would have to know which ip:port is the sender to be able to do this logic.
        // So here we use the assumption that a packet always arrives after it was sent (.time_delta comparisons)
        // we add each packet the first time we see it. The second time we see it, it must be the receive of that packet. 
        while ( i < packetsClient.length || j < packetsServer.length){
                //check if packet from client is send/received sooner than selected packet of server
            if (i < packetsClient.length && ((j < packetsServer.length && packetsClient[i].connectioninfo.time_delta <= (packetsServer[j].packet.connectioninfo.time_delta + packetsServer[j].delay)) 
                || (j >= packetsServer.length)))  {

                let originalcoord = packetsClient[i].connectioninfo.time_delta * 1000 * this.scale
                    let diff = originalcoord - basemargin

                    //if coordinate of arrow is too close or above previous coordinate, add margin
                    if ((i > 0|| j > 0) && diff < 45){
                        originalcoord = basemargin + 45
                    }
                    basemargin = originalcoord

                    //check if packet is already processed 
                let s_index = sequencepackets.findIndex(x => x.packet_number === packetsClient[i].headerinfo.packet_number)
                if (s_index > -1){
                    //packet is already sent, so add info about when it is received
                    sequencepackets[s_index].receive_time = packetsClient[i].connectioninfo.time_delta * 1000
                    //if send and receive time are equal, make arrow horizontal
                    if (sequencepackets[s_index].receive_time === sequencepackets[s_index].send_time) {
                        originalcoord = sequencepackets[s_index].send_coord
                        basemargin = originalcoord
                    }
                    sequencepackets[s_index].receive_coord = originalcoord
                    sequencepackets[s_index].packet_info1 = packetsClient[i]
                }
                //packet is not sent: so add info about when packet is sent
                else {

                    sequencepackets.push({
                        send_coord: originalcoord, 
                        send_time: packetsClient[i].connectioninfo.time_delta * 1000,
                        receive_coord: -1, 
                        receive_time: -1,
                        packet_info1: packetsClient[i],
                        packet_info2: null,
                        packet_number: packetsClient[i].headerinfo.packet_number
                    });
                }

                i++
            }
            else //packet from server is send/received sooner than packet from client
            if ( j < packetsServer.length ){
                let originalcoord = (packetsServer[j].packet.connectioninfo.time_delta + packetsServer[j].delay) * 1000 * this.scale
                let diff = originalcoord - basemargin

                if ((i > 0|| j > 0) && diff < 45){
                    originalcoord = basemargin + 45
                }
                basemargin = originalcoord

                let s_index = sequencepackets.findIndex(x => x.packet_number === packetsServer[j].packet.headerinfo.packet_number)
                if (s_index > -1) {

                    sequencepackets[s_index].receive_time = (packetsServer[j].packet.connectioninfo.time_delta + packetsServer[j].delay) * 1000
                    if (sequencepackets[s_index].receive_time === sequencepackets[s_index].send_time) {
                        originalcoord = sequencepackets[s_index].send_coord
                        basemargin = originalcoord
                    }
                    sequencepackets[s_index].receive_coord = originalcoord
                    sequencepackets[s_index].packet_info2 = packetsServer[j].packet
                }
                else {

                    sequencepackets.push({
                        send_coord: originalcoord,
                        send_time: (packetsServer[j].packet.connectioninfo.time_delta + packetsServer[j].delay) * 1000,
                        receive_coord: -1, 
                        receive_time: -1,
                        packet_info1: null,
                        packet_info2: packetsServer[j].packet,
                        packet_number: packetsServer[j].packet.headerinfo.packet_number
                    })
                }
                j++
            }
        }
        this.drawArrows(sequencepackets);
    },
    //add RTT delay to packets received/sent by server
    addDelayForServer(packets, calcrtt){
        let delayedpackets = new Array<{packet: QuicPacket, delay: number}>()
        let rtt = this.userRTT
        if (calcrtt) {
            rtt = this.calculatedRTT
        }

        for (let i = 0; i < packets.length; i++) {
            delayedpackets.push({packet: packets[i], delay: (rtt / 2 / 1000)})
        }
        return delayedpackets
    },
    drawArrows(sequencepackets: Array<SequenceGroup>){
        let arrowclass = Vue.extend(SequenceArrow)
        let serverinfoclass = Vue.extend(ServerInfo)

        //get largest y-coord to determine svg height
        let largestcoord = 0;
        for( let i = sequencepackets.length - 1; i > 0; --i ){
            let packet = sequencepackets[i];
            if( packet.receive_coord > largestcoord ){
                console.log("Coord found ", i, packet);
                largestcoord = packet.receive_coord;
            }
        }

        let container = d3.select(this.$el).append('svg')
            .attr('id', 'sequencediagram')
            .attr('height', largestcoord + 'px')
            .on('dblclick', this.removeArrowBackground)
        
        container.append('line').attr('x1', '150').attr('x2', '150').attr('y1', '-100').attr('y2', largestcoord + 100).attr('stroke', 'black')
        container.append('line').attr('x1', '850').attr('x2', '850').attr('y1', '-100').attr('y2', largestcoord + 100).attr('stroke', 'black')

        for (let i = 0; i < sequencepackets.length; i++) {
            let packet_info = sequencepackets[i].packet_info1 ? sequencepackets[i].packet_info1 : sequencepackets[i].packet_info2
            let packetinstance = new arrowclass({
                store: this.$store,
                propsData: {
                    packet_conn: packet_info,
                    send_coord: sequencepackets[i].send_coord,
                    send_time: sequencepackets[i].send_time,
                    receive_coord: sequencepackets[i].receive_coord,
                    receive_time: sequencepackets[i].receive_time
                }
            });

            packetinstance.$mount()
            this.$el.children[0].appendChild(packetinstance.$el)
            //position text of packet so it doesn't overlap
            packetinstance.$emit('translatedata')

            //add extra server info is present for packet on client side
            if (sequencepackets[i].packet_info1 && sequencepackets[i].packet_info1.serverinfo){
                let ytranslate = this.isClientSend(sequencepackets[i].packet_info1.headerinfo.dest_connection_id) ? sequencepackets[i].send_coord : sequencepackets[i].receive_coord
                let serverinfoinstance = new serverinfoclass({
                    propsData: {
                        packet_conn: sequencepackets[i].packet_info1,
                        ytranslate: ytranslate,
                        isclient: true
                    }
                })
                serverinfoinstance.$mount()
                this.$el.appendChild(serverinfoinstance.$el)
            }

            //add extra server info is present for packet on server side
            if (sequencepackets[i].packet_info2 && sequencepackets[i].packet_info2.serverinfo && this.using2files){
                let ytranslate = this.isClientSend(sequencepackets[i].packet_info1.headerinfo.dest_connection_id) ? sequencepackets[i].receive_coord : sequencepackets[i].send_coord
                let serverinfoinstance = new serverinfoclass({
                    propsData: {
                        packet_conn: sequencepackets[i].packet_info2,
                        ytranslate: ytranslate,
                        isclient: false
                    }
                })
                serverinfoinstance.$mount()
                this.$el.appendChild(serverinfoinstance.$el)
            }
        }
    },
    //when selecting new file(s), remove old diagram
    removeCurrentDiagram(){
        let children = <HTMLElement> this.$el
        for (let i = 0; i < this.$el.children.length; i++) {
            children.removeChild(this.$el.children[i])
            i--
        }
    },
    isClientSend(dcid){
        return this.$store.state.sequencesettings.isPacketClientSend(dcid)
    },
    removeArrowBackground(){
        let box = document.getElementById('arrow-background-box')
        if (box)
            box.remove()
    }
  },
  beforeUpdate(){
      this.removeCurrentDiagram()
      this.calcArrowCoords()
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
