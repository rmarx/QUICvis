import TraceWrapper from "@/data/TraceWrapper";
import { QuicPacket } from "@/data/quic";

export interface SelectedPacket {
    traceid: number,
    connid: number,
    packet: QuicPacket|null
}



export default class VisSettings{
    private _files: Array<TraceWrapper>
    private _selectedpacket: SelectedPacket;


    public constructor(){
        this._files = Array()
        this._selectedpacket = {
            traceid: 0,
            connid: 0,
            packet: null
        }
    }

    public getFile(index: number): TraceWrapper{
        return this._files[index]
    }

    public addFile(newfile: TraceWrapper): void{
        this._files.push(newfile);
    }

    public removeFile(index): void{
        this._files.splice(index, 1);
    }

    public getAllFiles(): Array<TraceWrapper>{
        return this._files
    }

    public setSelectedPacket(newpacketid: number, connid: number, traceid: number){
        this._selectedpacket.traceid = traceid;
        this._selectedpacket.connid = connid;
        this._selectedpacket.packet = this._files[traceid].getConn(connid).getPacketById(newpacketid);
    }

    public getSelectedPacket(): SelectedPacket{
        return this._selectedpacket
    }
}