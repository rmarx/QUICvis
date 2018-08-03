import VisSettings from "@/data/VisSettings";
import { QuicPacket } from "@/data/quic";

export default class SequenceSettings {
    private _traceindex1: number;
    private _traceindex2: number;

    private _connindex1: number;
    private _connindex2: number;

    private _1filertt: number;

    private _vissettings: VisSettings;

    constructor() {
        this._traceindex1 = -1;
        this._traceindex2 = -1;

        this._connindex1 = -1;
        this._connindex2 = -1;

        this._1filertt = 0;
        this._vissettings = new VisSettings();
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
                if (connids1_e2!.length > connids2_e1!.length){
                    let temp = connids2_e1
                    connids2_e1 = connids1_e2
                    connids1_e2 = temp
                }

                if (this.compareCIDS(connids1_e1!, connids2_e2!) && this.compareCIDS(connids1_e2!, connids2_e1!)) return true
                else return false
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

    public getPacketsConn1(): Array<QuicPacket>{
        return this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getSequencePackets()
    }

    public getPacketsConn2(): Array<QuicPacket>|null{
        if (this._traceindex2 >= 0 && this._connindex2 >= 0)
            return this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getSequencePackets()
        else return null
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