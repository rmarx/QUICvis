import { QuicConnection, QuicPacket } from "@/data/quic";

export interface TimelinePacket {
    timestamp: number,
    sender: boolean,
    frametype: number|null
}

export default class ConnWrapper{
    private _conn: QuicConnection;

    private _isfilteredout: boolean;

    private _backgroundcolour: string;

    private _filteredstreams: Array<boolean>;

    private _selectedPacket: QuicPacket|null;

    private _showStreams: boolean;

    private _streamstofilter: Array<{streamnr: number, filtered: boolean}>

    public constructor(conn: QuicConnection){
        this._conn = conn
        this._isfilteredout = false
        this._backgroundcolour = "#ff00ff"
        this._filteredstreams = Array()
        this._selectedPacket = null
        this._showStreams = false
        this._streamstofilter = new Array()
        this._streamstofilter.push({ streamnr: 0, filtered: false})
        this.addStreamsToFilter()
    }

    private addStreamsToFilter(){
        this._conn.packets.forEach((packet) => {
            if (packet.payloadinfo)
                packet.payloadinfo.framelist.forEach((frame) => {
                    if (frame.hasOwnProperty('stream_id') && !this._streamstofilter.hasOwnProperty(frame['stream_id']))
                        this._streamstofilter.push({streamnr: frame['stream_id'], filtered: false})
                })
        })
    }

    public getConn(): QuicConnection{
        return this._conn
    }

    public setConn(newconn: QuicConnection): void{
        this._conn = newconn;
    }

    public getIsFiltered(): boolean{
        return this._isfilteredout;
    }

    public invertIsFiltered(){
        this._isfilteredout = this._isfilteredout === false ? true : false
    }

    public getBgColor(): string{
        return this._backgroundcolour
    }

    public setBgColor(value: string){
        this._backgroundcolour = value
    }

    public getStreamFilters(): Array<{streamnr: number, filtered: boolean}> { 
        return this._streamstofilter
    }

    public setStreamFilters(tofilter: Array<number>) {
        if (tofilter.length === 0){
            this.initializeStreamFilters(false)
            return
        }else {
            this.initializeStreamFilters(true)
        }

        for (let i = 0; i < tofilter.length; i++) {
            for (let j = 0; j < this._streamstofilter.length; j++) {
                if (this._streamstofilter[j].streamnr === tofilter[i]){
                    this._streamstofilter[j].filtered = false
                    break;
                }
            }
        }
    }

    private initializeStreamFilters(basevalue: boolean){
        for (let j = 0; j < this._streamstofilter.length; j++) {
            this._streamstofilter[j].filtered = basevalue
        }
    }

    public getTimelinePackets(): Array<TimelinePacket>{
        let packets = new Array<TimelinePacket>()
        let frametype: number|null
        this._conn.packets.forEach((packet) => {
            if (packet.payloadinfo){
                console.log(packet.payloadinfo.framelist[0])
                frametype = 0x0
            }
            else
                frametype = null
            let timelinepacket: TimelinePacket = {
                timestamp: packet.time_delta,
                sender: true,
                frametype: frametype
            }

            packets.push(timelinepacket)
        })
        return packets
    }
}