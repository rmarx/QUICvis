import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock
} from "../data/quic"


export interface LogConnectionInfo{
    CID_endpoint1: Array<string>|null
    CID_endpoint2: Array<string>|null
    version: string|null
}


export class Ngtcp2LogParser extends Parser{
    //create object which contains info that needs to be stored to proces other packets
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
            CID_endpoint1: null,
            CID_endpoint2: null,
            version: null,
        }
        let packet: QuicPacket
        let connections = Array<QuicConnection>()
        this.getInitialInfo(tracefile[0], connloginfo)
        console.log(connloginfo)

        for (let i = 0; i < tracefile.length; i++) {
            this.parsePacket(tracefile[i], connloginfo)
        }
    }

    private parsePacket(packetinfo: string, connloginfo: LogConnectionInfo){
        let content = packetinfo.split("\n")
        let splitline
        let longheader: LongHeader

        content.forEach((el) =>{
            splitline = el.split(" ")

            if (splitline[2] === "frm" && (splitline[3] === "rx" || splitline[3] === "tx")) {
                let packetnr = splitline[4]
                let packettype = splitline[5]
                let frametype = splitline[6]
                console.log(packetnr, packettype, frametype)
                if (packettype.includes("Initial") || packettype.includes("Handshake")){
                    
                }
            }
        })
    }

    private splitOnEqual(tosplit: string): string{
        let split = tosplit.split("=")
        return split[1]
    }

    private getInitialInfo(packetinfo: string, connloginfo: LogConnectionInfo){
        let content = packetinfo.split("\n")
        let splitline

        let el = content[2]
        console.log(el)
        splitline = el.split(" ")

        if (splitline[2] === "pkt" && splitline[3] === "rx") {
            let packettype = this.splitOnEqual(splitline[7]) 
            if (packettype.includes("Initial") || packettype.includes("Handshake")){
                connloginfo.CID_endpoint1 = Array(this.splitOnEqual(splitline[5])),
                connloginfo.CID_endpoint2 = Array(this.splitOnEqual(splitline[6])),
                connloginfo.version = "0xFF00000B"
            }
        }
    }
}