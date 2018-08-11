import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock, ServerInfo, ConnectionInfo
} from "../data/quic"


export class QuickerLogParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        let trace = this.createTraceObject(name)
        tracefile = this.removeEscapeCharacters(tracefile)
        let packets = this.divideTextByPackets(tracefile)

        this.parsePackets(packets)
        
        return trace
    }

    private removeEscapeCharacters(tracefile: string): string{
        let filteredfile = tracefile.replace(/\[.{2,3}/g, "");
        return filteredfile
    }

    private divideTextByPackets(tracefile: string): Array<string>{
        let splitfile = tracefile.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3} \n  [R|T]/g)
        let delimiters = tracefile.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3} \n  [R|T]/g)
        splitfile.splice(0,1)

        for (let i = 0; i < splitfile.length; i++) {
            splitfile[i] = delimiters[i] + splitfile[i]
        }
        return splitfile
    }

    private createTraceObject(name: string): Trace{
        let trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private parsePackets(packets_string: Array<string>){
        let starttime = this.getTime(packets_string[0].split('\n')[0])
        let connections = new Array<QuicConnection>()
        packets_string.forEach((packet) => {
            this.parsePacket(packet, starttime, connections)
        })

        console.log(connections)
    }

    private getTime(timestamp: string): number{
        let starttime_string = timestamp.split('T')[1]

        return this.converTimeToMs(starttime_string)
    }

    private converTimeToMs(timestamp: string): number{
        let splittime = timestamp.split(':')
        let seconds = splittime[2].split('.')
        let time = parseFloat(seconds[1])
        time += parseFloat(seconds[0]) * 1000
        time += parseFloat(splittime[1]) * 60 * 1000
        time += parseFloat(splittime[0]) * 60 * 60 * 1000

        return time
    }

    private parsePacket(packet_string: string, starttime: number, connections: Array<QuicConnection>){
        let splitstring = packet_string.split('\n')
        let conn_info = this.parseConnectionInfo(splitstring[0], starttime)
        let headerinfo = this.parseHeaderInfo(splitstring[1] + splitstring[2])

        let packet: QuicPacket = {
            connectioninfo: conn_info,
            headerinfo: headerinfo,
            payloadinfo: null,
            serverinfo: null,
            size: 0
        }

        this.addPacketToConnection(packet, connections)
    }

    private parseConnectionInfo(conninfo_string: string, starttime: number): ConnectionInfo{
        let conn_info: ConnectionInfo = {
            src_ip_address: '',
            src_port_number: -1,
            dst_ip_address: '',
            dst_port_number: -1,
            time_delta: this.getTime(conninfo_string) - starttime
        }

        return conn_info
    }
    private parseHeaderInfo(headerinfo_string: string): Header {
        headerinfo_string = headerinfo_string.replace(/\s+/g, '--')
        let splitheaderinfo = headerinfo_string.split('--')
        splitheaderinfo.splice(0,1)

        let splitnow = true
        for (let i = 2; i < splitheaderinfo.length; i++) {
            if (!splitnow) {
                splitnow = true
                continue;
            }
            if (splitheaderinfo[i].indexOf(':') === -1 && i + 1 < splitheaderinfo.length && splitnow){
                splitheaderinfo[i] = splitheaderinfo[i] + '-' + splitheaderinfo[i + 1]
                splitheaderinfo.splice(i+1,1)
            }
            if (splitheaderinfo[i].indexOf(':') >= 0){
                splitnow = false
            }
        }

        if (splitheaderinfo[1].split('(')[1].slice(0, -1) === '0x5'){
            return this.parseShortHeader(splitheaderinfo)
        }
        else {
            return this.parseLongHeader(splitheaderinfo)
        }
    }

    private parseLongHeader(splitheaderinfo: Array<string>): LongHeader{
        let longheader: LongHeader = {
            header_form: 1,
            dest_connection_id: this.convertCID(splitheaderinfo[5].slice(0,-1)),
            src_connection_id: this.convertCID(splitheaderinfo[7]),
            long_packet_type: this.getPacketType(splitheaderinfo[1].split('(')[0]),
            packet_number: parseInt(splitheaderinfo[9]),
            version: splitheaderinfo[3] 
        }

        return longheader
    }

    private parseShortHeader(splitheaderinfo: Array<string>): ShortHeader{
        let shortheader: ShortHeader = {
            header_form: 0,
            dest_connection_id: this.convertCID(splitheaderinfo[3]),
            short_packet_type: this.getPacketType(splitheaderinfo[1].split('(')[0]),
            packet_number: parseInt(splitheaderinfo[5]),
            key_phase: false
        }

        return shortheader
    }

    private convertCID(cid: string): string{
        cid = cid.replace('0x', '')
        let splitcid = cid.match(/.{1,2}/g)
        let result = ""
        if (splitcid !== null) {
            for (let i = 0; i < splitcid!.length; i++) {
                result += splitcid![i]
                if (i < splitcid!.length - 1)
                    result += ":"
            }
        }
        return result
    }

    private getPacketType(headername: string): number{
        switch (headername) {
            case 'Initial':
                return 0x7f;
            case 'Retry':
                return 0x7e;
            case 'Handshake':
                return 0x7d;
            case 'Protected0RTT':
                return 0x7c;
            case 'Protected1RTT':
                return 0x0;
            default:
                break;
        }
    }

    private addPacketToConnection(packet: QuicPacket, connections: Array<QuicConnection>): number{
        if (!packet.headerinfo) return -1
        let index = -1

        //If there are no connections, create a new and add the packet to it
        if (connections.length === 0){
            index = this.createConnection(packet, connections)
            return index
        }
        index = this.addPacketWithDCID(packet, connections) 
        if (index !== -1)
            return index
        else {
            index = this.addPacketWithSCID(packet, connections)  
            if (index !== -1)
                return index
            else {
                index = this.createConnection(packet, connections)
                return index
            }
        }
    }

    /**
     * Checks if a connection exists where 1 endpoint has DCID, if so add packet to connection 
     */
    private addPacketWithDCID(packet: QuicPacket, connections: Array<QuicConnection>): number{
        if (!packet.headerinfo) return -1
        const headerinfo = packet.headerinfo
        let foundindex = -1;
        let BreakException = {}
        
        try {
            connections.forEach(function(el, index){
                if (el.CID_endpoint1!.findIndex(x => x === headerinfo.dest_connection_id) !== -1) {
                    foundindex = index;
                    el.packets.push(packet)

                    //check if SCID has changed, if so change value of CID for that endpoint
                    let src_conn_id= (<LongHeader> headerinfo).src_connection_id
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint2!.findIndex(x => x === src_conn_id) === -1) {
                        el.CID_endpoint2!.push(src_conn_id)
                    }

                    throw BreakException
                }
                if (el.CID_endpoint2!.findIndex(x => x === headerinfo.dest_connection_id) !== -1){
                    foundindex = index;
                    el.packets.push(packet)

                    let src_conn_id= (<LongHeader> headerinfo).src_connection_id
                    //check if SCID has changed, if so change value of CID for that endpoint
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint1!.findIndex(x => x === src_conn_id)) {
                        el.CID_endpoint1!.push(src_conn_id)
                    }

                    throw BreakException
                }
            })
        }catch(e){
            if (e !== BreakException) throw e;
        }

        return foundindex
    }

    /**
     * Checks if a connection exists where 1 endpoint has SCID, if so add packet to connection and update to new DCID
     */
    private addPacketWithSCID(packet: QuicPacket, connections: Array<QuicConnection>): number{
        if (!packet.headerinfo || packet.headerinfo.header_form === 0) return -1
        const headerinfo = <LongHeader> packet.headerinfo
        let foundindex = -1;
        let BreakException = {}
        
        try {
            connections.forEach(function(el, index){
                if (el.CID_endpoint1!.findIndex(x => x === headerinfo.src_connection_id) !== -1) {
                    foundindex = index;
                    el.packets.push(packet)
                    if (headerinfo.dest_connection_id)
                        el.CID_endpoint2!.push(headerinfo.dest_connection_id)
                    throw BreakException
                }
                if (el.CID_endpoint2!.findIndex(x => x === headerinfo.src_connection_id) !== -1){
                    foundindex = -1;
                    el.packets.push(packet)
                    if (headerinfo.dest_connection_id)
                        el.CID_endpoint1!.push(headerinfo.dest_connection_id)
                    throw BreakException
                }
            })
        }catch(e){
            if (e !== BreakException) throw e;
        }

        return foundindex
    }

    private createConnection(packet: QuicPacket, connections: Array<QuicConnection>): number{
        //TODO check if header_form is set to boolean and not string
        if (!packet.headerinfo || packet.headerinfo.header_form === 0)
            return -1

        let longheader = <LongHeader> packet.headerinfo
        let src_conn_id = longheader.src_connection_id
        let dst_conn_id = longheader.dest_connection_id
        let index = -1

        if (src_conn_id && dst_conn_id) {
            let conn: QuicConnection = {
                CID_endpoint1: Array(src_conn_id),
                CID_endpoint2: Array(dst_conn_id),
                packets: Array<QuicPacket>(packet)
            }

            index = connections.push(conn) - 1
        }
        return index
    }
}