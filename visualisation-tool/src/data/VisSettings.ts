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
    private _streamcolors: Array<{uni_di: boolean, cl_init: boolean, color: string}>


    public constructor(){
        this._files = Array()
        this._streamcolors = Array()
        this._selectedpacket = {
            traceid: 0,
            connid: 0,
            packet: null
        }
        this.initStreamColors()
    }

    private initStreamColors(){
        this._streamcolors.push({
            uni_di: false,
            cl_init: false,
            color: "#eac077"
        })

        this._streamcolors.push({
            uni_di: true,
            cl_init: false,
            color: "#76dfe2"
        })

        this._streamcolors.push({
            uni_di: false,
            cl_init: true,
            color: "#ede46a"
        })

        this._streamcolors.push({
            uni_di: true,
            cl_init: true,
            color: "#5dbbd3"
        })
    }

    public getStreamColor(cl_init: boolean, uni_di: boolean): string{
        let color = "";
        for (let i = 0; i < this._streamcolors.length; i++) {
            let stream = this._streamcolors[i]
            if (stream.uni_di === uni_di && stream.cl_init === cl_init){
                color = stream.color
                break;
            }
        }
        return color;
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