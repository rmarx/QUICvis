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

        let conn: QuicConnection = { packets: this.parseConnection(tracefile) }
        trace.connection = conn
        console.log(trace)
        return trace
    }

    private createTraceObject(name: string): Trace{
        let trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private parseConnection(tracefile: any): Array<QuicPacket>{
        let packetnr: any
        let ip_info: any
        let quic_info: any
        let udp_info: any
        let packets = Array<QuicPacket>()
        for (packetnr in tracefile){
            ip_info = tracefile[packetnr]._source.layers.ip
            quic_info = tracefile[packetnr]._source.layers.quic
            udp_info = tracefile[packetnr]._source.layers.udp
            packets.push(this.parsePacket(ip_info, udp_info, quic_info, tracefile[packetnr]._source.layers.frame["frame.time_delta"]))
        }
        return packets
    }

    private parsePacket(ip_info: any, udp_info: any, quic_info: any, time: any): QuicPacket{
        let payload: Payload = { framelist: this.parsePayload(quic_info)}
        let packet: QuicPacket = {
            src_ip_address: ip_info["ip.src_host"],
            src_port_number: udp_info["udp.srcport"],
            dst_ip_address: ip_info["ip.dst_host"],
            dst_port_number: udp_info["udp.dstport"],
            headerinfo: this.parseHeader(quic_info),
            payloadinfo: payload,
            time_delta: time
        }
        return packet
    }

    private parseHeader(quic_info: any): Header{
        let headertype = quic_info["quic.header_form"]

        switch (headertype) {
            case "1":
                return this.parseLongHeader(quic_info)
            case "0":
                return this.parseShortHeader(quic_info)
            default:
                var noheader: LongHeader = {
                    header_form: null,
                    long_packet_type: null,
                    connection_id: null,
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
            connection_id: quic_info["quic.connection_id"],
            version: quic_info["quic.version"],
            packet_number: quic_info["quic.packet_number_full"],
        } 
        return longheader
    }

    private parseShortHeader(quic_info: any): ShortHeader{
        let longheader: ShortHeader = {
            header_form: quic_info["quic.header_form"],
            short_packet_type: quic_info["quic.short.packet_type"],
            connection_id: quic_info["quic.connection_id"],
            flags: {
                omit_conn_id: quic_info["quic.short.ocid_flag"] === true,
                key_phase: quic_info["quic.short.kp_flag"] === true
            },
            packet_number: quic_info["quic.packet_number_full"],
        } 
        return longheader
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
                return this.parsePadding(frame)
            case "1":
                return this.parseRstStream(frame)
            case "2":
                return this.parseConnectionClose(frame)
            case "3":
                return this.parseApplicationClose(frame)
            case "4":
                return this.parseMaxData(frame)
            case "5":
                return this.parseMaxStreamData(frame)
            case "6":
                return this.parseMaxStreamId(frame)
            case "7":
                return this.parsePing()
            case "8":
                return this.parseBlocked(frame)
            case "9":
                return this.parseStreamBlocked(frame)
            case "10":
                return this.parseStreamIdBlocked(frame)
            case "11":
                return this.parseNewConnectionId(frame)
            case "12":
                return this.parseStopSending(frame)
            //TODO: change ack and path challenge code
            case "14":
                return this.parseAck(frame)
            case "13":
                return this.parsePathChallenge(frame)
            case "15":
                return this.parsePathResponse(frame)
            case "16":
            case "17":
            case "18":
            case "19":
            case "20":
            case "21":
            case "22":
            case "23":
                return this.parseStream(frame)
            default:
                return this.parsePing()
        }
    }

    private parsePadding(frame: any): Padding{
        let paddingframe: Padding = {
            length: frame["quic.frame_type.padding.length"]
        }

        return paddingframe
    }

    private parseRstStream(frame: any): Rst_Stream{
        let rstframe: Rst_Stream = {
            stream_id: frame["quic.frame_type.rsts.stream_id"],
            application_error_code: frame["quic.frame_type.rsts.application_error_code"],
            final_offset: frame["quic.frame_type.rsts.final_offset"]
        }

        return rstframe
    }

    private parseConnectionClose(frame: any): Connection_Close{
        let conn_close: Connection_Close = {
            error_code: frame["quic.frame_type.cc.error_code"],
            phrase_length: frame["quic.frame_type.cc.reason_phrase_length"],
            reason_phrase: frame["quic.frame_type.cc.reason_phrase"]
        }

        return conn_close
    }

    private parseApplicationClose(frame: any): Application_Close{
        let app_close: Application_Close = {
            error_code: frame["quic.frame_type.ac.error_code"],
            phrase_length: frame["quic.frame_type.ac.reason_phrase_length"],
            reason_phrase: frame["quic.frame_type.ac.reason_phrase"]
        }

        return app_close
    }

    private parseMaxData(frame: any): Max_Data{
        let max_data: Max_Data = {
            maximum_data: frame["quic.frame_type.md.maximum_data"]
        }

        return max_data
    }

    private parseMaxStreamData(frame: any): Max_Stream_Data{
        let max_stream_data: Max_Stream_Data = {
            stream_id: frame["quic.frame_type.msd.stream_id"],
            maximum_data: frame["quic.frame_type.msd.maximum_stream_data"]
        }

        return max_stream_data
    }

    private parseMaxStreamId(frame: any): Max_Stream_Id{
        let max_stream_id: Max_Stream_Id = {
            maximum_stream_id: frame["quic.frame_type.msi.stream_id"]
        }

        return max_stream_id
    }

    private parsePing(): Ping{
        let ping: Ping = {
            totext: "Ping"
        }

        return ping
    }

    private parseBlocked(frame: any): Blocked{
        let blocked: Blocked = {
            offset: frame["quic.stream.offset"]
        }

        return blocked
    }

    private parseStreamBlocked(frame: any): Stream_Blocked{
        let stream_blocked: Stream_Blocked = {
            stream_id: frame["quic.frame_type.blocked.stream_id"],
            offset: frame["quic.frame_type.blocked.offset"]
        }

        return stream_blocked
    }

    private parseStreamIdBlocked(frame: any): Stream_Id_Blocked{
        let stream_id_blocked: Stream_Id_Blocked = {
            stream_id: frame["quic.frame_type.sib.stream_id"]
        }

        return stream_id_blocked
    }

    private parseNewConnectionId(frame: any): New_Connection_Id{
        let new_connection_id: New_Connection_Id = {
            sequence: frame["quic.frame_type.nci.sequence"],
            connection_id: frame["quic.frame_type.nci.connection_id"],
            stateless_rst_token: frame["quic.frame_type.nci.stateless_reset_token"]
        }

        return new_connection_id
    }

    private parseStopSending(frame: any): Stop_Sending{
        let stop_sending: Stop_Sending = {
            stream_id: frame["quic.frame_type.ss.stream_id"],
            application_error_code: frame["quic.frame_type.ss.application_error_code"]
        }

        return stop_sending
    }

    private parseAck(frame: any): Ack{
        let ack: Ack = {
            largest_ack: frame["quic.frame_type.ack.largest_acknowledged"],
            ack_delay: frame["quic.frame_type.ack.ack_delay"],
            ack_block_count: frame["quic.frame_type.ack.ack_block_count"],
            ack_blocks: Array<AckBlock>()
        }

        return ack
    }

    private parsePathChallenge(frame: any): Path_Challenge{
        let path_challenge: Path_Challenge = {
            data: frame["quic.frame_type.path_challenge.data"]
        }

        return path_challenge
    }

    private parsePathResponse(frame: any): Path_Response{
        let path_response: Path_Response = {
            data: frame["quic.frame_type.path_response.data"]
        }

        return path_response
    }

    private parseStream(frame: any): Stream{
        let frame_flags = frame["quic.frame_type_tree"]
        let stream: Stream = {
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
}