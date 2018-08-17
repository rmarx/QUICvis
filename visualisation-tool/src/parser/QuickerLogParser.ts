import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked,
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock, ServerInfo, ConnectionInfo
} from "../data/quic"


export class QuickerLogParser extends Parser {
    public parse(name: string, tracefile: any): Trace {
        let trace = this.createTraceObject(name)
        tracefile = this.removeEscapeCharacters(tracefile)
        let packets = this.divideTextByPackets(tracefile)

        trace.connection = this.parsePackets(packets)

        return trace
    }

    private removeEscapeCharacters(tracefile: string): string {
        let filteredfile = tracefile.replace(/\[.{2,3}/g, "");
        return filteredfile
    }

    private divideTextByPackets(tracefile: string): Array<string> {
        let splitfile = tracefile.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3} \n  [R|T]/g)
        let delimiters = tracefile.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3} \n  [R|T]/g)
        splitfile.splice(0, 1)

        for (let i = 0; i < splitfile.length; i++) {
            splitfile[i] = delimiters[i] + splitfile[i]
        }
        return splitfile
    }

    private createTraceObject(name: string): Trace {
        let trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private parsePackets(packets_string: Array<string>): Array<QuicConnection> {
        let starttime = this.getTime(packets_string[0].split('\n')[0])
        let connections = new Array<QuicConnection>()
        packets_string.forEach((packet) => {
            this.parsePacket(packet, starttime, connections)
        })
        return connections
    }

    private getTime(timestamp: string): number {
        let starttime_string = timestamp.split('T')[1]

        return this.converTimeToMs(starttime_string)
    }

    private converTimeToMs(timestamp: string): number {
        let splittime = timestamp.split(':')
        let seconds = splittime[2].split('.')
        let time = parseFloat(seconds[1]) / 1000
        time += parseFloat(seconds[0])
        time += parseFloat(splittime[1]) * 60
        time += parseFloat(splittime[0]) * 60 * 60

        return time
    }

    private parsePacket(packet_string: string, starttime: number, connections: Array<QuicConnection>) {
        let splitstring = packet_string.split('\n')
        let conn_info = this.parseConnectionInfo(splitstring[0], starttime)
        let headerinfo = this.parseHeaderInfo(splitstring[1] + splitstring[2])

        let headerpart = splitstring[2].split(/\s+/g)
        let pksize = 0
        if (headerpart[3] === "payload")
            pksize = parseFloat(headerpart[5])

        splitstring.splice(0, 3)

        for (let i = 0; i < splitstring.length; i++) {
            splitstring[i] = splitstring[i].replace(/\s+/, '')
        }

        let payload: Payload = {
            framelist: this.parsePayload(this.groupDataPerFrame(splitstring))
        }
        let packet: QuicPacket = {
            connectioninfo: conn_info,
            headerinfo: headerinfo,
            payloadinfo: payload,
            serverinfo: null,
            size: pksize
        }
        this.addPacketToConnection(packet, connections)
    }

    private groupDataPerFrame(splitframeinfo: Array<string>): Array<string> {
        let splitnow = true
        let framenames = ['PADDING', 'RST_STREAM', 'CONNECTION_CLOSE', 'APPLICATION_CLOSE', 'MAX_DATA', 'MAX_STREAM_DATA', 'MAX_STREAM_ID', 'PING',
            'BLOCKED', 'STREAM_BLOCKED', 'STREAM_ID_BLOCKED', 'NEW_CONNECTION_ID', 'STOP_SENDING', 'ACK', 'PATH_CHALLENGE', 'PATH_RESPONSE', 'STREAM']
        for (let i = 0; i < splitframeinfo.length; i++) {
            if (framenames.indexOf(splitframeinfo[i].split(' ')[0]) === -1 && i + 1 < splitframeinfo.length && splitnow) {
                splitframeinfo[i - 1] = splitframeinfo[i - 1] + ' ' + splitframeinfo[i]
                splitframeinfo.splice(i, 1)
                i--
            }
        }

        return splitframeinfo
    }

    private parseConnectionInfo(conninfo_string: string, starttime: number): ConnectionInfo {
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
        splitheaderinfo.splice(0, 1)

        let splitnow = true
        for (let i = 2; i < splitheaderinfo.length; i++) {
            if (!splitnow) {
                splitnow = true
                continue;
            }
            if (splitheaderinfo[i].indexOf(':') === -1 && i + 1 < splitheaderinfo.length && splitnow) {
                splitheaderinfo[i] = splitheaderinfo[i] + '-' + splitheaderinfo[i + 1]
                splitheaderinfo.splice(i + 1, 1)
            }
            if (splitheaderinfo[i].indexOf(':') >= 0) {
                splitnow = false
            }
        }

        if (splitheaderinfo[1].split('(')[1].slice(0, -1) === '0x5') {
            return this.parseShortHeader(splitheaderinfo)
        }
        else {
            return this.parseLongHeader(splitheaderinfo)
        }
    }

    private parseLongHeader(splitheaderinfo: Array<string>): LongHeader {
        let longheader: LongHeader = {
            header_form: 1,
            dest_connection_id: this.convertCID(splitheaderinfo[5].slice(0, -1)),
            src_connection_id: this.convertCID(splitheaderinfo[7]),
            long_packet_type: this.getPacketType(splitheaderinfo[1].split('(')[0]),
            packet_number: parseInt(splitheaderinfo[9]),
            version: splitheaderinfo[3]
        }

        return longheader
    }

    private parseShortHeader(splitheaderinfo: Array<string>): ShortHeader {
        let shortheader: ShortHeader = {
            header_form: 0,
            dest_connection_id: this.convertCID(splitheaderinfo[3]),
            short_packet_type: this.getPacketType(splitheaderinfo[1].split('(')[0]),
            packet_number: parseInt(splitheaderinfo[5]),
            key_phase: false
        }

        return shortheader
    }

    private convertCID(cid: string): string {
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

    private getPacketType(headername: string): number {
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

    private parsePayload(splitframes: Array<string>): Array<Frame> {
        let frame_array = Array<Frame>()


        splitframes.forEach((frame) => {
            if (frame !== '')
                frame_array.push(this.parseFrameType(frame))
        });

        return frame_array
    }

    private parseFrameType(frame: string): Frame {
        let splitframe = frame.split(' ')[1]
        let frametype = parseInt(splitframe.substr(1, splitframe.length - 2))

        switch (frametype) {
            case 0:
                return this.parsePadding(frame, frametype)
            /*case 1:
                return this.parseRstStream(frame, frametype)*/
            case 2:
                return this.parseConnectionClose(frame, frametype)
            /*case 3:
                return this.parseApplicationClose(frame, frametype)*/
            case 4:
                return this.parseMaxData(frame, frametype)
            case 5:
                return this.parseMaxStreamData(frame, frametype)
            case 6:
                return this.parseMaxStreamId(frame, frametype)
            case 7:
                return this.parsePing(frametype)
            case 8:
                return this.parseBlocked(frame, frametype)
            case 9:
                return this.parseStreamBlocked(frame, frametype)
            case 10:
                return this.parseStreamIdBlocked(frame, frametype)
            /*case 11:
                return this.parseNewConnectionId(frame, frametype)
            case 12:
                return this.parseStopSending(frame, frametype)*/
            case 13:
                return this.parseAck(frame, frametype)
            case 14:
                return this.parsePathChallenge(frame, frametype)
            case 15:
                return this.parsePathResponse(frame, frametype)
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
                return this.parseStream(frame, frametype)
            default:
                return this.parsePing(frametype)
        }
    }

    private parsePadding(frame: string, frametype: number): Padding {
        let splitframe = frame.split(/\s+/g)
        let paddingframe: Padding = {
            frametype: frametype,
            length: parseInt(splitframe[3])
        }

        return paddingframe
    }

    private parseConnectionClose(frame: string, frametype: number): Connection_Close {
        let splitframe = frame.split(/\s+/g)
        let conn_close: Connection_Close = {
            frametype: frametype,
            error_code: parseInt(splitframe[4]),
            phrase_length: splitframe.slice(7, splitframe.length-1).toString().length,
            reason_phrase: splitframe.slice(7, splitframe.length-1).toString()
        }
        return conn_close
    }

    private parseMaxData(frame: any, frametype: number): Max_Data {
        let splitframe = frame.split(/\s+/g)
        let max_data: Max_Data = {
            frametype: frametype,
            maximum_data: parseInt(splitframe[3].split('=')[1])
        }

        return max_data
    }

    private parseMaxStreamData(frame: any, frametype: number): Max_Stream_Data {
        let splitframe = frame.split(/\s+/g)
        let max_stream_data: Max_Stream_Data = {
            frametype: frametype,
            stream_id: parseInt(splitframe[2].split('=')[1]),
            maximum_data: parseInt(splitframe[4].split('=')[1])
        }

        return max_stream_data
    }

    private parsePing(frametype: number): Ping {
        let ping: Ping = {
            frametype: frametype,
            totext: "Ping"
        }

        return ping
    }

    private parseMaxStreamId(frame: string, frametype: number): Max_Stream_Id {
        let splitframe = frame.split(/\s+/g)
        let max_stream_id: Max_Stream_Id = {
            frametype: frametype,
            maximum_stream_id: parseInt(splitframe[3].split('=')[1])
        }

        return max_stream_id
    }

    private parseBlocked(frame: string, frametype: number): Blocked {
        let splitframe = frame.split(/\s+/g)
        let blocked: Blocked = {
            frametype: frametype,
            offset: parseInt(splitframe[4])
        };
        return blocked
    }

    private parseStreamBlocked(frame: any, frametype: number): Stream_Blocked {
        let splitframe = frame.split(/\s+/g)
        let stream_blocked: Stream_Blocked = {
            frametype: frametype,
            stream_id: parseInt(splitframe[2].split('=')[1]),
            offset: parseInt(splitframe[5])
        }
        return stream_blocked
    }

    private parseStreamIdBlocked(frame: any, frametype: number): Stream_Id_Blocked {
        let splitframe = frame.split(/\s+/g)
        let stream_id_blocked: Stream_Id_Blocked = {
            frametype: frametype,
            stream_id: parseInt(splitframe[3].split('=')[1])
        }
        return stream_id_blocked
    }

    private parseStream(frame: string, frametype: number): Stream {
        let splitframe = frame.split(/\s+/g)

        let streamdata = ""
        for (let i = 9; i < splitframe.length; i++) {
            streamdata += splitframe[i]
        }
        let stream: Stream = {
            frametype: frametype,
            type_flags: {
                off_flag: splitframe[4].split('=')[1] == "1",
                len_flag: splitframe[3].split('=')[1] == "1",
                fin_flag: splitframe[2].split('=')[1] == "1"
            },
            stream_id: parseInt(splitframe[6].substr(1, splitframe[6].length - 2)),
            offset: parseInt(splitframe[8].split('=')[1]),
            length: parseInt(splitframe[7].split('=')[1]),
            stream_data: streamdata
        }

        return stream
    }

    private parseAck(frame: string, frametype: number): Ack {
        let splitframe = frame.split(/\s+/g)
        let ack: Ack = {
            frametype: frametype,
            largest_ack: parseInt(splitframe[3].split('=')[1]),
            ack_delay: parseInt(splitframe[5].split('=')[1]),
            ack_block_count: parseInt(splitframe[8].split('=')[1]),
            ack_blocks: Array<AckBlock>()
        }

        return ack
    }

    private parsePathChallenge(frame: any, frametype: number): Path_Challenge {
        let splitframe = frame.split(/\s+/g)
        let path_challenge: Path_Challenge = {
            frametype: frametype,
            data: splitframe[2].split('=')[1]
        }

        return path_challenge
    }

    private parsePathResponse(frame: any, frametype: number): Path_Response {
        let splitframe = frame.split(/\s+/g)
        let path_response: Path_Response = {
            frametype: frametype,
            data: splitframe[2].split('=')[1]
        }

        return path_response
    }

    private addPacketToConnection(packet: QuicPacket, connections: Array<QuicConnection>): number {
        if (!packet.headerinfo) return -1
        let index = -1

        //If there are no connections, create a new and add the packet to it
        if (connections.length === 0) {
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
    private addPacketWithDCID(packet: QuicPacket, connections: Array<QuicConnection>): number {
        if (!packet.headerinfo) return -1
        const headerinfo = packet.headerinfo
        let foundindex = -1;
        let BreakException = {}

        try {
            connections.forEach(function (el, index) {
                if (el.CID_endpoint1!.findIndex(x => x === headerinfo.dest_connection_id) !== -1) {
                    foundindex = index;
                    el.packets.push(packet)

                    //check if SCID has changed, if so change value of CID for that endpoint
                    let src_conn_id = (<LongHeader>headerinfo).src_connection_id
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint2!.findIndex(x => x === src_conn_id) === -1) {
                        el.CID_endpoint2!.push(src_conn_id)
                    }

                    throw BreakException
                }
                if (el.CID_endpoint2!.findIndex(x => x === headerinfo.dest_connection_id) !== -1) {
                    foundindex = index;
                    el.packets.push(packet)

                    let src_conn_id = (<LongHeader>headerinfo).src_connection_id
                    //check if SCID has changed, if so change value of CID for that endpoint
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint1!.findIndex(x => x === src_conn_id)) {
                        el.CID_endpoint1!.push(src_conn_id)
                    }

                    throw BreakException
                }
            })
        } catch (e) {
            if (e !== BreakException) throw e;
        }

        return foundindex
    }

    /**
     * Checks if a connection exists where 1 endpoint has SCID, if so add packet to connection and update to new DCID
     */
    private addPacketWithSCID(packet: QuicPacket, connections: Array<QuicConnection>): number {
        if (!packet.headerinfo || packet.headerinfo.header_form === 0) return -1
        const headerinfo = <LongHeader>packet.headerinfo
        let foundindex = -1;
        let BreakException = {}

        try {
            connections.forEach(function (el, index) {
                if (el.CID_endpoint1!.findIndex(x => x === headerinfo.src_connection_id) !== -1) {
                    foundindex = index;
                    el.packets.push(packet)
                    if (headerinfo.dest_connection_id)
                        el.CID_endpoint2!.push(headerinfo.dest_connection_id)
                    throw BreakException
                }
                if (el.CID_endpoint2!.findIndex(x => x === headerinfo.src_connection_id) !== -1) {
                    foundindex = -1;
                    el.packets.push(packet)
                    if (headerinfo.dest_connection_id)
                        el.CID_endpoint1!.push(headerinfo.dest_connection_id)
                    throw BreakException
                }
            })
        } catch (e) {
            if (e !== BreakException) throw e;
        }

        return foundindex
    }

    private createConnection(packet: QuicPacket, connections: Array<QuicConnection>): number {
        //TODO check if header_form is set to boolean and not string
        if (!packet.headerinfo || packet.headerinfo.header_form === 0)
            return -1

        let longheader = <LongHeader>packet.headerinfo
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