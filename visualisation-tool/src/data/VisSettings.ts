import TraceWrapper from "@/data/TraceWrapper";
import { QuicPacket } from "@/data/quic";

export interface FrameColour{
    framecode: number,
    colour: string
}

export interface SelectedPacket {
    traceid: number,
    connid: number,
    packet: QuicPacket|null
}

export enum Frametypes{
    PADDING = 0x00,
    RST_STREAM = 0x01,
    CONNECTION_CLOSE = 0x02,
    APPLICATION_CLOSE = 0x03, 
    MAX_DATA = 0x04, 
    MAX_STREAM_DATA = 0x05, 
    MAX_STREAM_ID = 0x06,
    PING = 0x07,
    BLOCKED = 0x08,
    STREAM_BLOCKED = 0x09,
    STREAM_ID_BLOCKED = 0x0a,
    NEW_CONNECTION_ID = 0x0b,
    STOP_SENDING = 0x0c,
    ACK = 0x0d,
    PATH_CHALLENGE = 0x0e,
    PATH_RESPONSE = 0x0f,
    STREAM = 0x10
}

export default class VisSettings{
    private _files: Array<TraceWrapper>
    private _framecolours: Array<FrameColour>
    private _selectedpacket: SelectedPacket;


    public constructor(){
        this._files = Array()
        this._framecolours = Array()
        this._selectedpacket = {
            traceid: 0,
            connid: 0,
            packet: null
        }
        this.setInitialColours()
    }

    private setInitialColours(){
        this._framecolours.push({
            framecode: Frametypes.PADDING,
            colour: "#9e0e04"
        })

        this._framecolours.push({
            framecode: Frametypes.RST_STREAM,
            colour: "#8c3804"
        })

        this._framecolours.push({
            framecode: Frametypes.CONNECTION_CLOSE,
            colour: "#8c5e04"
        })
        
        this._framecolours.push({
            framecode: Frametypes.APPLICATION_CLOSE,
            colour: "#8c7f08"
        })
        
        this._framecolours.push({
            framecode: Frametypes.MAX_DATA,
            colour: "#516b05"
        })
        
        this._framecolours.push({
            framecode: Frametypes.MAX_STREAM_DATA,
            colour: "#2a6b05"
        })

        this._framecolours.push({
            framecode: Frametypes.MAX_STREAM_ID,
            colour: "#015633"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PING,
            colour: "#113c51"
        })
        
        this._framecolours.push({
            framecode: Frametypes.BLOCKED,
            colour: "#593a16"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STREAM_BLOCKED,
            colour: "#112250"
        })
        

        this._framecolours.push({
            framecode: Frametypes.STREAM_ID_BLOCKED,
            colour: "#210f42"
        })

        this._framecolours.push({
            framecode: Frametypes.NEW_CONNECTION_ID,
            colour: "#5c0268"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STOP_SENDING,
            colour: "#680236"
        })
        
        this._framecolours.push({
            framecode: Frametypes.ACK,
            colour: "#43484c"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PATH_CHALLENGE,
            colour: "#2f3824"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PATH_RESPONSE,
            colour: "#ffffff"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STREAM,
            colour: "#4c1e1e"
        })
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

    public getFrameColour(frametype: number): string{
        for (let i = 0; i < this._framecolours.length; i++) {
            if (this._framecolours[i].framecode === frametype)
                return this._framecolours[i].colour
        }
        return '#ffffff'
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