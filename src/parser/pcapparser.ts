import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader
} from "../data/quic"
import { connect } from "net";

export class PcapParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        var trace = this.createTraceObject(name)

        var conn: QuicConnection = { packets: this.parseConnection(tracefile) }
        trace.connection = conn
        //console.log(trace)
        return trace
    }

    private createTraceObject(name: string): Trace{
        var trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private parseConnection(tracefile: any): Array<QuicPacket>{
        var packetnr: any
        var ip_info: any
        var quic_info: any
        var udp_info: any
        var packets = Array<QuicPacket>()
        for (packetnr in tracefile){
            ip_info = tracefile[packetnr]._source.layers.ip
            quic_info = tracefile[packetnr]._source.layers.quic
            udp_info = tracefile[packetnr]._source.layers.udp
            packets.push(this.parsePacket(ip_info, udp_info, quic_info, tracefile[packetnr]._source.layers.frame["frame.time_delta"]))
        }
        return packets
    }

    private parsePacket(ip_info: any, udp_info: any, quic_info: any, time: any): QuicPacket{
        var packet: QuicPacket = {
            src_ip_address: ip_info["ip.src_host"],
            src_port_number: udp_info["udp.srcport"],
            dst_ip_address: ip_info["ip.dst_host"],
            dst_port_number: udp_info["udp.dstport"],
            headerinfo: this.parseHeader(quic_info),
            payloadinfo: null,
            time_delta: time
        }
        this.parsePayload(quic_info)
        return packet
    }

    private parseHeader(quic_info: any): Header{
        var headertype = quic_info["quic.header_form"]

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
        var longheader: LongHeader = {
            header_form: quic_info["quic.header_form"],
            long_packet_type: quic_info["quic.long.packet_type"],
            connection_id: quic_info["quic.connection_id"],
            version: quic_info["quic.version"],
            packet_number: quic_info["quic.packet_number_full"],
        } 
        return longheader
    }

    private parseShortHeader(quic_info: any): ShortHeader{
        var longheader: ShortHeader = {
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

    private parsePayload(quic_info: any) : void{
        console.log(quic_info["quic.frame"])
    }
}