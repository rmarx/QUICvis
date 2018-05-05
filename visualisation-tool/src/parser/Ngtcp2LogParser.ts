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
        let content = packetinfo.split("\n")
        let splitline
        let longheader: LongHeader
        let shortheader: ShortHeader

        for (let i = 0; i < content.length; i++) {
            const el = content[i];
            splitline = el.split(" ")

            if (splitline[2] === "frm" && (splitline[3] === "rx" || splitline[3] === "tx")) {
                let packetnr = splitline[4]
                let packettype = splitline[5]
                let frametype = splitline[6]

                if (packettype.includes("Handshake")){
                    longheader = {
                        header_form: true,
                        dest_connection_id: splitline[3] === "rx" ? connloginfo.CID_tx![0] : connloginfo.CID_rx![0],
                        long_packet_type: parseInt(this.splitOnSymbol(packettype, "(").slice(0, -1)),
                        src_connection_id: splitline[3] === "rx" ? connloginfo.CID_rx![0] : connloginfo.CID_tx![0],
                        version: connloginfo.version,
                        packet_number: parseInt(packetnr)
                    }
                    console.log(longheader)
                    break;
                }
                else if (packettype.includes("Initial")){
                    longheader = {
                        header_form: true,
                        dest_connection_id: splitline[3] === "rx" ? connloginfo.CID_tx![0] : connloginfo.CID_rx![0],
                        long_packet_type: parseInt(this.splitOnSymbol(packettype, "(").slice(0, -1)),
                        src_connection_id: splitline[3] === "rx" ? connloginfo.CID_rx![0] : connloginfo.CID_tx![0],
                        version: connloginfo.version,
                        packet_number: parseInt(packetnr)
                    }
                    let serverinfo = this.getTransportParameters(content)
                    for (let j = 0; j < serverinfo.length; j++) {
                        if (serverinfo[i].infotype === "initial_version"){
                            connloginfo.version = parseInt(serverinfo[i].infocontent)
                            longheader.version = connloginfo.version
                            break;
                        }
                    }
                    console.log(longheader)
                    break;
                }
                else {
                    shortheader = {
                        header_form: false,
                        dest_connection_id: splitline[3] === "rx" ? connloginfo.CID_tx![0] : connloginfo.CID_rx![0],
                        short_packet_type: parseInt(this.splitOnSymbol(packettype, "(").slice(0, -1)),
                        flags: {
                            omit_conn_id: false,
                            key_phase: false
                        },
                        packet_number: parseInt(packetnr)
                    }
                    console.log(shortheader)
                    break;
                }
            }
        }
    }

    private getTransportParameters(content: Array<string>): Array<ServerInfo>{
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
                infoarray.push(infoobject)
            }
        }

        return infoarray
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
}