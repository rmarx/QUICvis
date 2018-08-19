import VisSettings from "@/data/VisSettings";
import { QuicPacket, Ack } from "@/data/quic";

export interface SequencePackets {
    packet_conn1: QuicPacket,
    packet_conn2: QuicPacket|null;
    start_time: number
}

export interface SequenceFilter {
    name: string,
    toShow: boolean
}

export default class SequenceSettings {
    private _traceindex1: number;
    private _traceindex2: number;

    private _connindex1: number;
    private _connindex2: number;

    private _1filertt: number;
    private _time_scale: number;

    private _vissettings: VisSettings;
    private _seqfilters: Array<SequenceFilter>

    constructor() {
        this._traceindex1 = -1;
        this._traceindex2 = -1;

        this._connindex1 = -1;
        this._connindex2 = -1;

        this._1filertt = 0;
        this._time_scale = 10;
        this._vissettings = new VisSettings();

        this._seqfilters = new Array()
        this.addSequenceFilters()
    }

    private addSequenceFilters(){
        this._seqfilters.push({
            name: 'packetnrs',
            toShow: true
        })

        this._seqfilters.push({
            name: 'headername',
            toShow: true
        })

        this._seqfilters.push({
            name: 'timestamps',
            toShow: true
        })

        this._seqfilters.push({
            name: 'streamnrs',
            toShow: true
        })
    }

    public changeFilter(name: string){
        let index = this._seqfilters.findIndex(filter => filter.name === name)

        if (index >=0)
            this._seqfilters[index].toShow = !this._seqfilters[index].toShow
    }

    public getSeqFilter(name: string): boolean{
        let index = this._seqfilters.findIndex(filter => filter.name === name)
        if (index >=0)
            return this._seqfilters[index].toShow
        else
            return false
    }

    public getAllSeqFilters(): Array<SequenceFilter>{
        return this._seqfilters
    }

    public setTraceindex1(index: number){
        this._traceindex1 = index
    }

    public setTraceindex2(index: number){
        this._traceindex2 = index
    }

    public setConnindex1(index: number){
        this._connindex1 = index
    }

    public setConnindex2(index: number){
        this._connindex2 = index
    }

    public set1filertt(rtt: number){
        this._1filertt = rtt
    }

    public getTraceindex1(): number{
        return this._traceindex1
    }

    public getTraceindex2(): number{
        return this._traceindex2
    }

    public getConnindex1(): number{
        return this._connindex1
    }

    public getConnindex2(): number{
        return this._connindex2
    }

    public get1filertt(): number{
        return this._1filertt;
    }

    public setVisSettings(vis: VisSettings){
        this._vissettings = vis;
    }

    public getTimeScale(): number{
        return this._time_scale
    }

    public setTimeScale(scale: number) {
        this._time_scale = scale
    }

    public getValidFiles(): boolean{
        if (this._traceindex1 >= 0 && this._connindex1 >= 0 && this._traceindex2 < 0) return true;
        else 
            if (this._traceindex1 >= 0 && this._connindex1 >= 0 && this._traceindex2 >= 0 && this._connindex2 >= 0 && this._traceindex1 !== this._traceindex2){
                let connids1_e1 = this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getConn().CID_endpoint1
                let connids1_e2 = this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getConn().CID_endpoint2

                let connids2_e1 = this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getConn().CID_endpoint1
                let connids2_e2 = this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getConn().CID_endpoint2
                

                if (connids1_e1!.length > connids2_e2!.length){
                    let temp = connids2_e2
                    connids2_e2 = connids1_e1
                    connids1_e1 = temp
                }
                if (this.compareCIDS(connids1_e1!, connids2_e2!)) {
                    if (connids1_e2!.length > connids2_e1!.length){
                        let temp = connids2_e1
                        connids2_e1 = connids1_e2
                        connids1_e2 = temp
                    }
                    if (this.compareCIDS(connids1_e2!, connids2_e1!))
                        return true
                    else 
                        return false
                }
                else {
                    if (connids1_e1!.length > connids2_e2!.length){
                        let temp = connids1_e1
                        connids1_e1 = connids2_e2
                        connids2_e2 = temp
                    }

                    if (connids1_e1!.length > connids2_e1!.length){
                        let temp = connids2_e1
                        connids2_e1 = connids1_e1
                        connids1_e1 = temp
                    }
                    if (this.compareCIDS(connids1_e1!, connids2_e1!)) {
                        if (connids1_e2!.length > connids2_e2!.length){
                            let temp = connids2_e2
                            connids2_e2 = connids1_e2
                            connids1_e2 = temp
                        }
                        if (this.compareCIDS(connids1_e2!, connids2_e2!))
                            return true
                        else 
                            return false
                    }
                    else 
                        return false
                }
            }
            else 
                return false;
    }

    private compareCIDS(cids_e1: Array<string>, cids_e2: Array<string>): boolean{
        let correctfiles = true;
        for (let i = 0; i < cids_e1.length; i++) {
            if (cids_e2.findIndex(x => x === cids_e1[i]) === -1){
                correctfiles = false;
                break;
            }
        }

        return correctfiles
    }

    public getPackets(): Array<SequencePackets>{
        let seqpackets = new Array<SequencePackets>()
        let packets_c1 = this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getSequencePackets()

        packets_c1.forEach((packet) => {
            seqpackets.push({packet_conn1: packet, packet_conn2: null, start_time: packet.connectioninfo.time_delta})
        })

        if (this._traceindex2 >= 0 && this._connindex2 >= 0){
            let packets_c2 = this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getSequencePackets()

            packets_c2.forEach((packet) => {
                let index = seqpackets.findIndex(seqpacket => seqpacket.packet_conn1.headerinfo.packet_number === packet.headerinfo.packet_number)
                if (index >= 0){
                    seqpackets[index].packet_conn2 = packet
                    if (packet.connectioninfo.time_delta < seqpackets[index].start_time)
                        seqpackets[index].start_time = packet.connectioninfo.time_delta
                }
            })

            seqpackets.sort(function(a,b) {
                return a.start_time - b.start_time
            })
        }
        else {
            let cl_rtt_factor = 0
            let se_rtt_factor = 0
            let cl_rtt_used = true
            let se_rtt_used = false
            for (let i = 0; i < packets_c1.length; i++) {
                if (this.isPacketClientSend(packets_c1[i].headerinfo.dest_connection_id) && se_rtt_used){
                    se_rtt_factor++
                    se_rtt_used = false
                }
                if (!this.isPacketClientSend(packets_c1[i].headerinfo.dest_connection_id) && cl_rtt_used){
                    cl_rtt_factor++
                    cl_rtt_used = false
                }

                if (this.isPacketClientSend(packets_c1[i].headerinfo.dest_connection_id)){
                    seqpackets[i].start_time = cl_rtt_factor * this._1filertt
                    cl_rtt_used = true
                }

                if (!this.isPacketClientSend(packets_c1[i].headerinfo.dest_connection_id)){
                    seqpackets[i].start_time = se_rtt_factor * this._1filertt
                    se_rtt_used = true
                }
            }
        }
        return seqpackets
    }

    private getRTTOfPacket(packet: QuicPacket, packets: Array<QuicPacket>): number{
        let RTT = -1
        for (let i = 0; i < packets.length; i++) {
            let frames = packets[i].payloadinfo.framelist

            let index = frames.findIndex(frame => parseFloat(frame.frametype) === 13)
            if (index >= 0){
                let ackframe = <Ack> frames[index]
                if (parseInt(ackframe.largest_ack) === parseInt(packet.headerinfo.packet_number)){
                    RTT = (packets[i].connectioninfo.time_delta * 1000) -  (packet.connectioninfo.time_delta * 1000)
                    break;
                }
            }
        }

        return RTT
    }

    public isPacketClientSend(dcid: string): boolean{
        return this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).checkIfClient(dcid)
    }

    public getLargestTime(): number{
        let packets1 = this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getSequencePackets();
        let time = 0;

        packets1.forEach((packet) => {
            if (packet.connectioninfo!.time_delta > time)
                time = packet.connectioninfo!.time_delta
        })

        if (this._traceindex2 >= 0 && this._connindex2 >= 0) {
            let packets2 = this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getSequencePackets();
            packets2.forEach((packet) => {
                if (packet.connectioninfo!.time_delta > time)
                    time = packet.connectioninfo!.time_delta
            })
        }

        return time
    }

    public getFirstRTT(): number {
        let packets1 = this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getSequencePackets();
        let RTT = 0;

        let time1 = packets1[0].connectioninfo!.time_delta
        let connid1 =  packets1[0].headerinfo!.dest_connection_id

        for (let index = 1; index < packets1.length; index++) {
            let packet = packets1[1]
            if (packet.headerinfo!.dest_connection_id  !== connid1 ) {
                RTT = packet.connectioninfo!.time_delta - time1
            }
        }

        if (RTT === 0)
            RTT = 1
        return (RTT * 1000)
    }
}