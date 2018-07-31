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
            return false;
    }

    public getPacketsConn1(): Array<QuicPacket>{
        return this._vissettings.getFile(this._traceindex1).getConn(this._connindex1).getSequencePackets()
    }

    public getPacketsConn2(): Array<QuicPacket>{
        return this._vissettings.getFile(this._traceindex2).getConn(this._connindex2).getSequencePackets()
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
}