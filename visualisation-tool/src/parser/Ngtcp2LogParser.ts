import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock, ServerInfo
} from "../data/quic"


export interface LogConnectionInfo{
    CID_tx: Array<string>|null
    CID_rx: Array<string>|null
    version: number|null
    packetnr: number|null
}


export class Ngtcp2LogParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        let trace = this.createTraceObject(name)

        let processed_file = this.processFile(tracefile);
        //console.log(processed_file)
        this.parseAllPackets(processed_file)
        return trace
    }

    private createTraceObject(name: string): Trace{
        let trace: Trace = {
            name: name,
            connection: null
        }
        return trace
    }

    private processFile(tracefile: any): Array<string>{
        let packetsinstring = Array<string>()
        let currentpacket = "";
        let filecontents = <string> tracefile
        let splitline: Array<string>;
        let currentpacketnr = "";

        let splitfile = filecontents.split("\n")
        for (let i = 0; i < splitfile.length; i++) {
            let partfile = splitfile[i]
            //check if current line has needed info
            if (partfile[0] === 'I'){
                splitline = partfile.split(" ")
                //check if a new packet is received, if so parse this
                if (splitline[2] === "con" && splitline[3] === "recv") {
                    if (currentpacket !== ""){
                        //add packet to string array
                        packetsinstring.push(currentpacket)
                        currentpacket = ""
                    }
                    currentpacketnr = ""
                    currentpacket = splitfile[i]
                    let isend = false
                    for (i; i < splitfile.length && !isend; i++) {
                        if (splitfile[i][0] === 'I') {
                            partfile = splitfile[i]
                            currentpacket += "\n" + partfile
                            splitline = partfile.split(" ")
                        }
                        //check is packet is fully processed, if so end loop
                        if (splitline[6] === "left" && splitline[7] === "0") {
                            isend = true
                            i--;
                        }
                    }
                }
                //check if it's an outgoing packet
                else if (splitline[2] === "frm" && splitline[3] === "tx"){
                    //check if a new packetnr is present, if so start fresh for new packet
                    if (splitline[4] !== currentpacketnr){
                        packetsinstring.push(currentpacket)
                        currentpacketnr = splitline[4]
                        currentpacket = partfile
                    }
                    else{
                        currentpacket += "\n" + partfile
                    }
                }
            }
        }
        if (currentpacket !== "")
            packetsinstring.push(currentpacket)
        return packetsinstring
    }

    private parseAllPackets(tracefile: Array<string>){
        let connloginfo: LogConnectionInfo = {
            CID_rx: null,
            CID_tx: null,
            version: null,
            packetnr: null
        }
        let packet: QuicPacket
        let connections = Array<QuicConnection>()
        this.getInitialInfo(tracefile[0], connloginfo)

        for (let i = 0; i < tracefile.length; i++) {
            this.parsePacket(tracefile[i], connloginfo)
        }
    }

    private parsePacket(packetinfo: string, connloginfo: LogConnectionInfo){
        let packet: QuicPacket
        let content = packetinfo.split("\n")
        let serverinfo = this.getTransportParameters(content, connloginfo)
        let header = this.parseHeader(content, connloginfo)
        let framelist = this.parsePayload(content)
        packet = {
            src_ip_address: "",
            src_port_number: -1,
            dst_ip_address: "",
            dst_port_number: -1,
            headerinfo: header,
            payloadinfo: { framelist: framelist},
            time_delta: -1,
            serverinfo: serverinfo
        }
        console.log(packet)
        
    }

    private parseHeader(content: Array<string>, connloginfo: LogConnectionInfo): Header|null{
        let header: Header
        let splitline

        for (let i = 0; i < content.length; i++) {
            const el = content[i];
            splitline = el.split(" ")

            if (splitline[2] === "frm" && (splitline[3] === "rx" || splitline[3] === "tx")) {
                let packetnr = splitline[4]
                let packettype = splitline[5]
                let frametype = splitline[6]

                if (packettype.includes("Handshake") || packettype.includes("Initial")){
                    header = this.parseLongHeader(splitline[3], packettype, packetnr, connloginfo)
                    return header
                }
                else {
                    header = this.parseShortHeader(splitline[3], packettype, packetnr, connloginfo)
                    return header
                }
            }
        }
        return null
    }

    private parseLongHeader(origin: string, packettype: string, packetnr: string, connloginfo: LogConnectionInfo): LongHeader{
        let longheader = {
            header_form: true,
            dest_connection_id: origin === "rx" ? connloginfo.CID_tx![0] : connloginfo.CID_rx![0],
            long_packet_type: parseInt(this.splitOnSymbol(packettype, "(").slice(0, -1)),
            src_connection_id: origin === "rx" ? connloginfo.CID_rx![0] : connloginfo.CID_tx![0],
            version: connloginfo.version,
            packet_number: parseInt(packetnr)
        }
        return longheader;
    }

    private parseShortHeader(origin: string, packettype: string, packetnr: string, connloginfo: LogConnectionInfo): ShortHeader{
        let shortheader = {
            header_form: false,
            dest_connection_id: origin === "rx" ? connloginfo.CID_tx![0] : connloginfo.CID_rx![0],
            short_packet_type: parseInt(this.splitOnSymbol(packettype, "(").slice(0, -1)),
            flags: {
                omit_conn_id: false,
                key_phase: false
            },
            packet_number: parseInt(packetnr)
        }
        return shortheader
    }

    private getTransportParameters(content: Array<string>, connloginfo: LogConnectionInfo): Array<ServerInfo>|null{
        let infoarray = Array<ServerInfo>()
        let infoobject: ServerInfo
        let line: string
        let splitline: Array<string>
        for (let i = 0; i < content.length; i++) {
            line = content[i];
            splitline = line.split(" ")
            if (splitline[2] === "cry" && splitline[3] === "remote"){
                splitline = splitline[5].split("=")
                infoobject = {
                    infotype: splitline[0],
                    infocontent: splitline[1]
                }
                if (infoobject.infotype === "initial_version"){
                    connloginfo.version = parseInt(infoobject.infocontent)
                }
                infoarray.push(infoobject)
            }
        }
        if (infoarray.length > 0)
            return infoarray
        else
            return null
    }

    private splitOnSymbol(tosplit: string, symbol: string): string{
        let split = tosplit.split(symbol)
        return split[1]
    }

    private getInitialInfo(packetinfo: string, connloginfo: LogConnectionInfo){
        let content = packetinfo.split("\n")
        let splitline

        let el = content[2]
        splitline = el.split(" ")

        if (splitline[2] === "pkt" && splitline[3] === "rx") {
            let packettype = this.splitOnSymbol(splitline[7], "=") 
            if (packettype.includes("Initial") || packettype.includes("Handshake")){
                connloginfo.CID_tx = Array(this.splitOnSymbol(splitline[5], "=")),
                connloginfo.CID_rx = Array(this.splitOnSymbol(splitline[6], "=")),
                connloginfo.CID_tx.push(splitline[1])
                connloginfo.version = 0xFF00000B
            }
        }
    }

    private parsePayload(content: Array<string>): Array<Frame>{
        let splitline: Array<string>
        let framelist = Array<Frame>()

        for (let i = 0; i < content.length; i++) {
            splitline = content[i].split(" ");
            if (splitline[2] === "frm" && (splitline[3] === "rx" || splitline[3] === "tx")) {
                let frameinfo = splitline.slice(6)
                let frametype = parseInt(this.splitOnSymbol(frameinfo[0], "(").slice(0,-1))
                
                switch (frametype) {
                    case 0: //padding
                        framelist.push(this.parsePadding(frameinfo))
                        break;
                    case 1: //rst_stream
                        break;
                    case 2: //connection_close
                        break;
                    case 3: //application_close
                        break;
                    case 4: //max_data
                        break;
                    case 5: //max_stream_data
                        break;
                    case 6: //max_stream_id
                        break;
                    case 7: //ping
                        break;
                    case 8: //blocked
                        break;
                    case 9: //stream_blocked
                        break;
                    case 10: //stream_id_blocked
                        break;
                    case 11: //new_connection_id
                        break;
                    case 12: //stop_sending
                        break;
                    case 13: //ack
                        break;
                    case 14: //path_challenge
                        break;
                    case 15: //path_response
                        break;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 21:
                    case 22:
                    case 23: //stream
                        framelist.push(this.parseStream(frameinfo, frametype))
                        break;
                    default:
                        break;
                }
            }
        }
        return framelist
    }

    private parseStream(frameinfo: Array<string>, frametype: number): Stream{
        let off_flag_val = 4
        let len_flag_val = 2
        let fin_flag_val = 1
        let stream: Stream = {
            stream_id: parseInt(this.splitOnSymbol(frameinfo[1], "=")),
            offset: parseInt(this.splitOnSymbol(frameinfo[3], "=")),
            length : parseInt(this.splitOnSymbol(frameinfo[4], "=")),
            type_flags: {
                off_flag: (frametype & off_flag_val) ? true : false,
                fin_flag: (frametype & fin_flag_val) ? true : false,
                len_flag: (frametype & len_flag_val) ? true : false
            },
            stream_data: ""
        }
        return stream
    }

    private parsePadding(frameinfo: Array<string>): Padding{
        let padding: Padding = {
            length: parseInt(this.splitOnSymbol(frameinfo[1], "="))
        }

        return padding
    }
}