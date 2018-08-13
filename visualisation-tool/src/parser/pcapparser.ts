import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock
} from "../data/quic"
import { connect } from "net";

export class PcapParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        let trace = this.createTraceObject(name)

        let conn = this.parseAllPackets(tracefile) ;
        trace.connection = conn
        //console.log(conn)
        return trace
    }

    private createTraceObject(name: string): Trace{
        let trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private parseAllPackets(tracefile: any): Array<QuicConnection>{
        let packetnr: any
        let ip_info: any
        let quic_info: any
        let udp_info: any
        let packet: QuicPacket
        let connections = Array<QuicConnection>()
        let connindex = -1
        for (packetnr in tracefile){
            ip_info = tracefile[packetnr]._source.layers.ip
            quic_info = tracefile[packetnr]._source.layers.quic
            udp_info = tracefile[packetnr]._source.layers.udp
            if (!quic_info) continue;
            packet = this.parsePacket(ip_info, udp_info, quic_info, parseFloat(tracefile[packetnr]._source.layers.frame["frame.time_relative"]))
            connindex = this.addPacketToConnection(packet, connections)
            if (packet.payloadinfo &&  this.isNewConnectionId(packet.payloadinfo))
                this.addAditionalConnId(packet, connections, connindex)
        }
        return connections
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
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint2!.findIndex(x => x === src_conn_id) !== -1) {
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

    private parsePacket(ip_info: any, udp_info: any, quic_info: any, time: any): QuicPacket{
        let payload: Payload = { framelist: this.parsePayload(quic_info)}
        let packet: QuicPacket = {
            connectioninfo: {
                src_ip_address: ip_info["ip.src_host"],
                src_port_number: udp_info["udp.srcport"],
                dst_ip_address: ip_info["ip.dst_host"],
                dst_port_number: udp_info["udp.dstport"],
                time_delta: time,
            },
            headerinfo: this.parseHeader(quic_info),
            payloadinfo: payload,
            serverinfo: null,
            size: parseInt(udp_info["udp.length"])
        }
        return packet
    }

    private parseHeader(quic_info: any): Header{
        let headertype = quic_info["quic.header_form"]
        //TODO add case to parse version negotiation packet
        switch (headertype) {
            case "1":
                return this.parseLongHeader(quic_info)
            case "0":
                return this.parseShortHeader(quic_info)
            default:
                var noheader: LongHeader = {
                    header_form: null,
                    long_packet_type: null,
                    dest_connection_id: null,
                    src_connection_id: null,
                    version: null,
                    packet_number: null,  
                }
                return noheader
        }
    }

    private parseLongHeader(quic_info: any): LongHeader{
        let longheader: LongHeader = {
            header_form: quic_info["quic.header_form"],
            long_packet_type: quic_info["quic.long.packet_type"],
            dest_connection_id: quic_info["quic.dcid"],
            src_connection_id: quic_info["quic.scid"],
            version: quic_info["quic.version"],
            packet_number: parseInt(quic_info["quic.packet_number_full"]),
        } 
        return longheader
    }

    private parseShortHeader(quic_info: any): ShortHeader{
        let shortheader: ShortHeader = {
            header_form: quic_info["quic.header_form"],
            short_packet_type: quic_info["quic.short.packet_type"],
            dest_connection_id: quic_info["quic.dcid"],
            key_phase: quic_info["quic.short.kp_flag"] === true,
            packet_number: parseInt(quic_info["quic.packet_number_full"]),
        } 
        return shortheader
    }

    private parsePayload(quic_info: any) : Array<Frame>{
        let frames = quic_info["quic.frame"]
        let frame_array = Array<Frame>()

        if (frames != null) {
            if (frames.length != null) {
                Array.prototype.forEach.call(frames ,frame => {
                    frame_array.push(this.parseFrameType(frame))
                });
            }
            else
                frame_array.push(this.parseFrameType(frames))
        }
        return frame_array
    }

    private parseFrameType(frame: any): Frame{
        let frametype = frame["quic.frame_type"]
        switch (frametype) {
            case "0":
                return this.parsePadding(frame, frametype)
            case "1":
                return this.parseRstStream(frame, frametype)
            case "2":
                return this.parseConnectionClose(frame, frametype)
            case "3":
                return this.parseApplicationClose(frame, frametype)
            case "4":
                return this.parseMaxData(frame, frametype)
            case "5":
                return this.parseMaxStreamData(frame, frametype)
            case "6":
                return this.parseMaxStreamId(frame, frametype)
            case "7":
                return this.parsePing(frametype)
            case "8":
                return this.parseBlocked(frame, frametype)
            case "9":
                return this.parseStreamBlocked(frame, frametype)
            case "10":
                return this.parseStreamIdBlocked(frame, frametype)
            case "11":
                return this.parseNewConnectionId(frame, frametype)
            case "12":
                return this.parseStopSending(frame, frametype)
            case "13":
                return this.parseAck(frame, frametype)
            case "14":
                return this.parsePathChallenge(frame, frametype)
            case "15":
                return this.parsePathResponse(frame, frametype)
            case "16":
            case "17":
            case "18":
            case "19":
            case "20":
            case "21":
            case "22":
            case "23":
                return this.parseStream(frame, frametype)
            default:
                return this.parsePing(frametype)
        }
    }

    private parsePadding(frame: any, frametype: number): Padding{
        let paddingframe: Padding = {
            frametype: frametype,
            length: frame["quic.frame_type.padding.length"]
        }

        return paddingframe
    }

    private parseRstStream(frame: any, frametype: number): Rst_Stream{
        let rstframe: Rst_Stream = {
            frametype: frametype,
            stream_id: frame["quic.frame_type.rsts.stream_id"],
            application_error_code: frame["quic.frame_type.rsts.application_error_code"],
            final_offset: frame["quic.frame_type.rsts.final_offset"]
        }

        return rstframe
    }

    private parseConnectionClose(frame: any, frametype: number): Connection_Close{
        let conn_close: Connection_Close = {
            frametype: frametype,
            error_code: frame["quic.frame_type.cc.error_code"],
            phrase_length: frame["quic.frame_type.cc.reason_phrase_length"],
            reason_phrase: frame["quic.frame_type.cc.reason_phrase"]
        }

        return conn_close
    }

    private parseApplicationClose(frame: any, frametype: number): Application_Close{
        let app_close: Application_Close = {
            frametype: frametype,
            error_code: frame["quic.frame_type.ac.error_code"],
            phrase_length: frame["quic.frame_type.ac.reason_phrase_length"],
            reason_phrase: frame["quic.frame_type.ac.reason_phrase"]
        }

        return app_close
    }

    private parseMaxData(frame: any, frametype: number): Max_Data{
        let max_data: Max_Data = {
            frametype: frametype,
            maximum_data: frame["quic.frame_type.md.maximum_data"]
        }

        return max_data
    }

    private parseMaxStreamData(frame: any, frametype: number): Max_Stream_Data{
        let max_stream_data: Max_Stream_Data = {
            frametype: frametype,
            stream_id: frame["quic.frame_type.msd.stream_id"],
            maximum_data: frame["quic.frame_type.msd.maximum_stream_data"]
        }

        return max_stream_data
    }

    private parseMaxStreamId(frame: any, frametype: number): Max_Stream_Id{
        let max_stream_id: Max_Stream_Id = {
            frametype: frametype,
            maximum_stream_id: frame["quic.frame_type.msi.stream_id"]
        }

        return max_stream_id
    }

    private parsePing(frametype: number): Ping{
        let ping: Ping = {
            frametype: frametype,
            totext: "Ping"
        }

        return ping
    }

    private parseBlocked(frame: any, frametype: number): Blocked{
        let blocked: Blocked = {
            frametype: frametype,
            offset: frame["quic.stream.offset"]
        }

        return blocked
    }

    private parseStreamBlocked(frame: any, frametype: number): Stream_Blocked{
        let stream_blocked: Stream_Blocked = {
            frametype: frametype,
            stream_id: frame["quic.frame_type.blocked.stream_id"],
            offset: frame["quic.frame_type.blocked.offset"]
        }

        return stream_blocked
    }

    private parseStreamIdBlocked(frame: any, frametype: number): Stream_Id_Blocked{
        let stream_id_blocked: Stream_Id_Blocked = {
            frametype: frametype,
            stream_id: frame["quic.frame_type.sib.stream_id"]
        }

        return stream_id_blocked
    }

    private parseNewConnectionId(frame: any, frametype: number): New_Connection_Id{
        let new_connection_id: New_Connection_Id = {
            frametype: frametype,
            sequence: frame["quic.frame_type.nci.sequence"],
            connection_id: frame["quic.frame_type.nci.connection_id"],
            stateless_rst_token: frame["quic.frame_type.nci.stateless_reset_token"]
        }

        return new_connection_id
    }

    private parseStopSending(frame: any, frametype: number): Stop_Sending{
        let stop_sending: Stop_Sending = {
            frametype: frametype,
            stream_id: frame["quic.frame_type.ss.stream_id"],
            application_error_code: frame["quic.frame_type.ss.application_error_code"]
        }

        return stop_sending
    }

    private parseAck(frame: any, frametype: number): Ack{
        let ack: Ack = {
            frametype: frametype,
            largest_ack: frame["quic.frame_type.ack.largest_acknowledged"],
            ack_delay: frame["quic.frame_type.ack.ack_delay"],
            ack_block_count: frame["quic.frame_type.ack.ack_block_count"],
            ack_blocks: Array<AckBlock>()
        }

        return ack
    }

    private parsePathChallenge(frame: any, frametype: number): Path_Challenge{
        let path_challenge: Path_Challenge = {
            frametype: frametype,
            data: frame["quic.frame_type.path_challenge.data"]
        }

        return path_challenge
    }

    private parsePathResponse(frame: any, frametype: number): Path_Response{
        let path_response: Path_Response = {
            frametype: frametype,
            data: frame["quic.frame_type.path_response.data"]
        }

        return path_response
    }

    private parseStream(frame: any, frametype: number): Stream{
        let frame_flags = frame["quic.frame_type_tree"]
        let stream: Stream = {
            frametype: frametype,
            type_flags: {
                off_flag: frame_flags["quic.frame_type.stream.off"] == "1",
                len_flag: frame_flags["quic.frame_type.stream.len"] == "1",
                fin_flag: frame_flags["quic.frame_type.stream.fin"] == "1"
            },
            stream_id: frame["quic.stream.stream_id"],
            offset: frame["quic.stream.offset"],
            length: frame["quic.stream.length"],
            stream_data: frame["quic.stream_data"]
        }

        return stream
    }

    private isNewConnectionId(payload: New_Connection_Id | Payload): payload is New_Connection_Id {
        return (<New_Connection_Id>payload).connection_id !== undefined;
    }

    private addAditionalConnId(packet: QuicPacket, connections: Array<QuicConnection>, connindex: number){
        if (connindex === -1 && packet.payloadinfo && !this.isNewConnectionId(packet.payloadinfo)) return

        let dst_conn_id = packet.headerinfo!.dest_connection_id
        let conn = connections[connindex]
        let conn_id_frame = <New_Connection_Id> packet.payloadinfo!.framelist[0]
        if (conn.CID_endpoint1!.findIndex(x => x === dst_conn_id) !== -1)
            conn.CID_endpoint2!.push(conn_id_frame.connection_id.toString())
        else
            conn.CID_endpoint1!.push(conn_id_frame.connection_id.toString())
    }
}