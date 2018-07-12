import { QuicConnection, QuicPacket, Frame } from "@/data/quic";

export interface TimelinePacket {
    timestamp: number,
    isclient: boolean,
    frametype: number|null
}

export interface TimelineStreams {
    timestamp: number,
    frames: Array<Frame>
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
        this._selectedPacket = this._conn.packets[0]
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

    public getShowStreams(): boolean{
        return this._showStreams
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
        let client: boolean
        this._conn.packets.forEach((packet) => {
            if (packet.payloadinfo && packet.payloadinfo.framelist.length > 0){
                frametype = packet.payloadinfo.framelist[0]['frametype']
            }
            else
                frametype = null

            if (packet.headerinfo && packet.headerinfo.dest_connection_id){
                client = this.checkIfClient(packet.headerinfo.dest_connection_id)
            }
            else 
                client = true
            let timelinepacket: TimelinePacket = {
                timestamp: packet.connectioninfo!.time_delta,
                isclient: client,
                frametype: frametype
            }

            packets.push(timelinepacket)
        })
        return packets
    }

    private checkIfClient(dcid: string): boolean{
        if (this._conn.CID_endpoint1 && this._conn.CID_endpoint1.indexOf(dcid) > -1)
            return true
        else
            return false
    }

    public getSelectedPacket(): QuicPacket|null{
        return this._selectedPacket
    }

    public setSelectedPacket(packetid: number) {
        this._selectedPacket = this._conn.packets[packetid]
    }

    public isPacketSelected(packetid: number): boolean{
        return this._conn.packets.indexOf(this._selectedPacket!) === packetid
    }

    public getPacketById(packetid: number): QuicPacket{
        return this._conn.packets[packetid]
    }

    public getTimelineStreams(): Array<TimelineStreams>{
        let timelinestreams = new Array<TimelineStreams>()
        this._conn.packets.forEach((packet) => {
            timelinestreams.push({
                timestamp: packet.connectioninfo!.time_delta,
                frames: packet.payloadinfo!.framelist
            })
        })
        return timelinestreams
    }

    public getAmountStreamsToShow(): number{
        let amount = 0;
        this._streamstofilter.forEach((stream) => {
            if (!stream.filtered)
                amount++
        })
        return amount
    }

    public toggleShowStreams(){
        this._showStreams = !this._showStreams;
    }
}