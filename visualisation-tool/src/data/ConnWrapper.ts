import { QuicConnection, QuicPacket, Frame } from "@/data/quic";

export interface TimelinePacket {
    timestamp: number,
    isclient: boolean,
    frametype: Array<number>
}

export interface TimelineStreams {
    timestamp: number,
    frames: Array<Frame>
}

export default class ConnWrapper{
    private _conn: QuicConnection;

    private _isfilteredout: boolean;

    private _backgroundcolour: string;

    private _selectedPacket: QuicPacket|null;

    private _showStreams: boolean;

    private _streamstofilter: Array<{streamnr: number, filtered: boolean, uni_di: boolean, cl_init: boolean}>

    private _xoffset: number;

    public constructor(conn: QuicConnection, color: string){
        this._conn = conn
        this._isfilteredout = false
        this._backgroundcolour = color
        this._selectedPacket = null
        this._showStreams = false
        this._streamstofilter = new Array()
        this._xoffset = 0;
        this._streamstofilter.push({ streamnr: 0, filtered: false, cl_init: true, uni_di: false})
        this.addStreamsToFilter()
    }

    private addStreamsToFilter(){
        this._conn.packets.forEach((packet) => {
            if (packet.payloadinfo)
                packet.payloadinfo.framelist.forEach((frame) => {
                    let streamnr = parseInt(frame['stream_id'])
                    if (frame.hasOwnProperty('stream_id') && !this.hasProperty(streamnr)){
                        let bit_streamnr = streamnr;
                        let cl_init = bit_streamnr >> 1 === 1 ? false : true;
                        let uni_di = bit_streamnr >> 1 === 1 ? true : false;
                        this._streamstofilter.push({streamnr: streamnr, filtered: false, cl_init: cl_init, uni_di: uni_di})
                    }
                })
        })
        this._selectedPacket = this._conn.packets[0]
    }

    private hasProperty(streamnr: number): boolean{
        let has = false;
        for (let i = 0; i < this._streamstofilter.length; i++) {
            if (this._streamstofilter[i].streamnr === streamnr){
                has = true;
                break;
            }
        }
        return has;
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

    public resetStreamFilters(){
        for (let j = 0; j < this._streamstofilter.length; j++) {
            this._streamstofilter[j].filtered = false
        }
    }

    public filterOutStream(streamnr: number){
        for (let i = 0; i < this._streamstofilter.length; i++) {
            if (this._streamstofilter[i].streamnr === streamnr){
                this._streamstofilter[i].filtered = true
                break;
            }
        }
    }

    public getTimelinePackets(): Array<TimelinePacket>{
        let packets = new Array<TimelinePacket>()
        let client: boolean
        this._conn.packets.forEach((packet) => {
            let framelist = Array<number>()
            if (packet.payloadinfo){
                packet.payloadinfo.framelist.forEach((el) => {
                    framelist.push(el['frametype'])
                })
            }

            if (packet.headerinfo && packet.headerinfo.dest_connection_id){
                client = this.checkIfClient(packet.headerinfo.dest_connection_id)
            }
            else 
                client = true
            let timelinepacket: TimelinePacket = {
                timestamp: packet.connectioninfo!.time_delta,
                isclient: client,
                frametype: framelist
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

    public setXOffset(offset: number){
        this._xoffset = offset
    }

    public getXOffset(): number {
        return this._xoffset
    }
}