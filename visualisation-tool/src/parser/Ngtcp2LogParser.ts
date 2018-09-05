import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock, ServerInfo
} from "../data/quic"
import { TIMEOUT } from "dns";


export interface LogConnectionInfo{
    CID_tx: Array<string>|null
    CID_rx: Array<string>|null
    version: string|null
    packetnr: number|null
}


export class Ngtcp2LogParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        let trace = this.createTraceObject(name)
        let processed_file = this.processFile(tracefile);
        trace.connection = this.parseAllPackets(processed_file)

        for (let i = 0; i < trace.connection.length; i++) {
            if (trace.connection[i].packets.length === 0){
                trace.connection.splice(i, 1)
                i--
            }
        }

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
                        if ((splitline[2] === "frm" && splitline[4] === 'tx')) {
                            isend = true
                            i--;
                            let split = currentpacket.split('\n')
                            split.splice(split.length-1,1)
                            currentpacket = split.toString()
                        }
                    }
                }
                //check if it's an outgoing packet
                else if (splitline[2] === "frm" && (splitline[4] === "tx" || splitline[4] === "rx")){
                    //check if a new packetnr is present, if so start fresh for new packet
                    if (splitline[3] !== currentpacketnr){
                        packetsinstring.push(currentpacket)
                        currentpacketnr = splitline[3]
                        currentpacket = partfile
                    }
                    else{
                        currentpacket += "\n" + partfile
                    }
                }
                if (splitline[2] === "rcv" && splitline[3] === "packet" && splitline[4] === "lost")
                    currentpacket += "\n" + partfile
            }
        }
        if (currentpacket !== "")
            packetsinstring.push(currentpacket)
        return packetsinstring
    }

    private parseAllPackets(tracefile: Array<string>): Array<QuicConnection>{
        let connloginfo: LogConnectionInfo = {
            CID_rx: null,
            CID_tx: null,
            version: null,
            packetnr: null
        }
        let packet: QuicPacket
        let connections = Array<QuicConnection>()
        let connindex: number

        for (let i = 0; i < tracefile.length; i++) {
            if (tracefile[i] === "") continue;
            packet = this.parsePacket(tracefile[i], connloginfo, connections)
            connindex = this.addPacketToConnection(packet, connections)
            if (packet.payloadinfo &&  this.isNewConnectionId(packet.payloadinfo))
                this.addAditionalConnId(packet, connections, connindex)
        }
        return connections
    }

    private parsePacket(packetinfo: string, connloginfo: LogConnectionInfo, connections: Array<QuicConnection>): QuicPacket{
        let packet: QuicPacket
        let content = packetinfo.split("\n")
        let serverinfo = this.getExtraServerInfo(content)
        let transportparams = this.getTransportParameters(content, connloginfo)
        let header = this.parseHeader(content, connloginfo, connections)
        let framelist = this.parsePayload(content)
        let time_delta = this.splitOnSymbol(content[0].split(" ")[0], "I")

        if (transportparams && serverinfo)
            serverinfo.concat(transportparams)
        
        time_delta = time_delta.substring(0, 5) + "." + time_delta.substring(5, time_delta.length)
        packet = {
            connectioninfo: {
                src_ip_address: "",
                src_port_number: -1,
                dst_ip_address: "",
                dst_port_number: -1,
                time_delta: parseFloat(time_delta)
            },
            headerinfo: header,
            payloadinfo: { framelist: framelist},
            serverinfo: serverinfo ? serverinfo : transportparams,
            size: this.getPacketSize(content[0])
        }
        return packet
        
    }

    private getPacketSize(line: string): number {
        let splitline = line.split(' ')
        let size = 0
        if (splitline.length === 6 && splitline[3] === 'recv' && splitline[4] === 'packet'){
            size = parseInt(this.splitOnSymbol(splitline[5], '='))
        }
        return size
    }

    private parseHeader(content: Array<string>, connloginfo: LogConnectionInfo, connections: Array<QuicConnection>): Header|null{
        let header: Header
        let splitline
        let dcid = "0x"
        let scid = "0x"
        let checkids = true
        let longheader: LongHeader

        for (let i = 0; i < content.length; i++) {
            const el = content[i];
            splitline = el.split(" ")

            if (checkids) {
                if (splitline[5].includes("dcid=") && splitline[6].includes("scid=")) {
                    dcid = this.splitOnSymbol(splitline[5], "=")
                    scid = this.splitOnSymbol(splitline[6], "=")
                    dcid = this.parseCID(dcid);
                    if (scid !== '0x')
                        scid = this.parseCID(scid)
                    checkids = false
                }
                else {
                    dcid = "0x"
                    scid = "0x"
                }
            }
            if (splitline[2] === "frm" && (splitline[4] === "rx" || splitline[4] === "tx")) {
                let packettype = splitline[5]
                if (packettype.includes("Handshake") || packettype.includes("Initial")){
                    longheader = this.parseLongHeader(content, i, connloginfo, connections)
                    if (dcid !== "0x" && scid !== "0x") {
                        longheader.dest_connection_id = dcid
                        longheader.src_connection_id = scid
                    }

                    return longheader
                }
                else {
                    header = this.parseShortHeader(content, i, connloginfo, connections)
                    if (dcid !== "0x")
                        header.dest_connection_id = dcid
                    return header
                }
            }
        }
        return null
    }

    private parseCID(cid: string): string{
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

    private parseLongHeader(content: Array<string>, contentindex: number, connloginfo: LogConnectionInfo, connections: Array<QuicConnection>): LongHeader{
        let line = content[contentindex].split(" ")
        let servercid = this.parseCID(line[1])
        let connindex = -1
        for (let i = 0; i < connections.length; i++) {
            let el = connections[i]
            if (el.CID_endpoint1!.findIndex(x => x === servercid) !== -1){
                connindex = i;
                break;
            }
        }

        if (connindex === -1) 
            connindex = this.createConnection(content, connloginfo, connections)

        let cide1index = connections[connindex].CID_endpoint1!.length - 1
        let cide2index = connections[connindex].CID_endpoint2!.length - 1
        let longheader = {
            header_form: 1,
            dest_connection_id: line[4] === "tx" ? connections[connindex].CID_endpoint2![cide2index] : connections[connindex].CID_endpoint1![cide1index],
            long_packet_type: parseInt(this.splitOnSymbol(line[5], "(").slice(0, -1)),
            src_connection_id: line[4] === "tx" ? connections[connindex].CID_endpoint1![cide1index] : connections[connindex].CID_endpoint2![cide2index],
            version: connloginfo.version,
            packet_number: parseInt(line[3])
        }

        return longheader;
    }

    private parseShortHeader(content: Array<string>, contentindex: number, connloginfo: LogConnectionInfo, connections: Array<QuicConnection>): ShortHeader{
        let line = content[contentindex].split(" ")
        let servercid = this.parseCID(line[1])
        let connindex = -1
        for (let i = 0; i < connections.length; i++) {
            let el = connections[i]
            if (el.CID_endpoint1!.findIndex(x => x === servercid) !== -1){
                connindex = i;
                break;
            }
        }

        let cide1index = connections[connindex].CID_endpoint1!.length - 1
        let cide2index = connections[connindex].CID_endpoint2!.length - 1
        if (connindex === -1)
            connindex = this.createConnection(content, connloginfo, connections)
        
        let shortheader = {
            header_form: 0,
            dest_connection_id: line[4] === "tx" ? connections[connindex].CID_endpoint2![cide2index] : connections[connindex].CID_endpoint1![cide1index],
            short_packet_type: parseInt(this.splitOnSymbol(line[5], "(").slice(0, -1)),
            key_phase: false,
            packet_number: parseInt(line[3])
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
                    connloginfo.version = infoobject.infocontent
                }
                infoarray.push(infoobject)
            }
        }
        if (infoarray.length > 0)
            return infoarray
        else
            return null
    }

    private getExtraServerInfo(content: Array<string>): Array<ServerInfo>|null{
        let infoarray = Array<ServerInfo>()
        let infoobject: ServerInfo
        let line: string
        let splitline: Array<string>
        for (let i = 0; i < content.length; i++) {
            line = content[i];
            splitline = line.split(" ")
            if (splitline[2] === "rcv" && !splitline[3].includes("loss_detection_alarm") && splitline[3] !== "packet"){
                let subarr = splitline.slice(3)
                for (let j = 0; j < subarr.length; j++) {
                    splitline = subarr[j].split("=")
                    if (splitline.length === 2) {
                        infoobject = {
                            infotype: splitline[0],
                            infocontent: splitline[1]
                        }
                        infoarray.push(infoobject)
                    }
                }
            }
            else 
                if (splitline[2] === "rcv" && !splitline[3].includes("loss_detection_alarm") && splitline[3] === "packet" && splitline[4] === "lost"){
                    let subarr = splitline.slice(3)
                    infoarray.push({
                        infotype: "lost packet",
                        infocontent: subarr[2]
                    })
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

    private parsePayload(content: Array<string>): Array<Frame>{
        let splitline: Array<string>
        let framelist = Array<Frame>()

        for (let i = 0; i < content.length; i++) {
            splitline = content[i].split(" ");
            if (splitline[2] === "frm" && (splitline[4] === "rx" || splitline[4] === "tx")) {
                let frameinfo = splitline.slice(6)
                let frametype = parseInt(this.splitOnSymbol(frameinfo[0], "(").slice(0,-1))
                switch (frametype) {
                    case 0: //padding
                        framelist.push(this.parsePadding(frameinfo, frametype))
                        break;
                    case 1: //rst_stream
                        break;
                    case 2: //connection_close
                        framelist.push(this.parseConnectionClose(frameinfo, frametype))
                        break;
                    case 3: //application_close
                        break;
                    case 4: //max_data
                        framelist.push(this.parseMaxData(frameinfo, frametype))
                        break;
                    case 5: //max_stream_data
                        break;
                    case 6: //max_stream_id
                        framelist.push(this.parseMaxStreamId(frameinfo, frametype))
                        break;
                    case 7: //ping
                        framelist.push(this.parsePing(frametype))
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
                        let ack_block_count = parseInt(this.splitOnSymbol(frameinfo[3], "="))
                        let ackblocksinfo = Array<Array<string>>()
                        let k = 0
                        for (let j = 1; j < ack_block_count + 1; j++){
                            splitline = content[i + j].split(" ");
                            let blockinfo = splitline.slice(6)
                            ackblocksinfo.push(blockinfo)
                            k = k + j
                        }
                        i += k
                        
                        framelist.push(this.parseAck(frameinfo, ackblocksinfo, frametype))
                        i++;
                        break;
                    case 14: //path_challenge
                        framelist.push(this.parsePathChallenge(frameinfo, frametype))
                        break;
                    case 15: //path_response
                        framelist.push(this.parsePathResponse(frameinfo, frametype))
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

    private parseMaxData(frameinfo: Array<string>, frametype: number): Max_Data{
        let max_data: Max_Data = {
            maximum_data: parseInt(this.splitOnSymbol(frameinfo[1], "=")),
            frametype: frametype
        }
        return max_data
    }

    private parseConnectionClose(frameinfo: Array<string>, frametype: number): Connection_Close {
        let phrase_length = parseInt(this.splitOnSymbol(frameinfo[2], "="))
        let conn_close: Connection_Close = {
            error_code: parseInt(this.splitOnSymbol(frameinfo[1], "(").slice(0, -1)),
            reason_phrase: phrase_length === 0 ? "" : this.splitOnSymbol(frameinfo[3], "="),
            phrase_length: phrase_length,
            frametype: frametype
        }
        return conn_close
    }

    private parsePing(frametype: number): Ping{
        return {totext: 'Ping', frametype: frametype}
    }

    private parseMaxStreamId(frameinfo: Array<string>, frametype: number): Max_Stream_Id{
        let max_stream_id: Max_Stream_Id = {
            maximum_stream_id: parseInt(this.splitOnSymbol(frameinfo[1], "=")),
            frametype: frametype
        }
        return max_stream_id
    }

    private parseStream(frameinfo: Array<string>, frametype: number): Stream{
        let off_flag_val = 4
        let len_flag_val = 2
        let fin_flag_val = 1
        let stream: Stream = {
            frametype: frametype,
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

    private parsePadding(frameinfo: Array<string>, frametype: number): Padding{
        let padding: Padding = {
            frametype: frametype,
            length: parseInt(this.splitOnSymbol(frameinfo[1], "="))
        }

        return padding
    }

    private parsePathChallenge(frameinfo: Array<string>, frametype: number): Path_Challenge{
        let path_challenge: Path_Challenge = {
            frametype: frametype,
            data: this.splitOnSymbol(frameinfo[1], "=")
        }

        return path_challenge
    }

    private parsePathResponse(frameinfo: Array<string>, frametype: number): Path_Response{
        let path_response: Path_Response = {
            frametype: frametype,
            data: this.splitOnSymbol(frameinfo[1], "=")
        }

        return path_response
    }

    private parseAck(frameinfo: Array<string>, ackblocksinfo: Array<Array<string>>, frametype: number): Ack{
        let ack_delay = this.splitOnSymbol(frameinfo[2], "=")
        let ack: Ack = {
            frametype: frametype,
            largest_ack: parseInt(this.splitOnSymbol(frameinfo[1], "=")),
            ack_delay: parseInt(this.splitOnSymbol(ack_delay, "(").slice(0, -1)),
            ack_block_count: parseInt(this.splitOnSymbol(frameinfo[3], "=")),
            ack_blocks: this.parseAckBlocks(ackblocksinfo),
        }

        return ack
    }

    private parseAckBlocks(ackblocksinfo: Array<Array<string>>): Array<AckBlock>{
        let ackblocks = Array<AckBlock>()
        let ackblock: AckBlock

        for (let i = 0; i < ackblocksinfo.length; i++) {
            let blockinfo = ackblocksinfo[i]

            ackblock = {
                ack_block_field: 0,
                gap_field: 0
            }
        }
        return ackblocks
    }

    private addPacketToConnection(packet: QuicPacket, connections: Array<QuicConnection>): number{
        if (!packet.headerinfo) return -1
        let index = -1

        index = this.addPacketWithDCID(packet, connections) 
        if (index !== -1)
            return index
        else {
            index = this.addPacketWithSCID(packet, connections)  
            return index
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
                    if (el.CID_endpoint2!.length === 0)
                        el.CID_endpoint2!.push(src_conn_id!)

                    throw BreakException
                }
                if (el.CID_endpoint2!.findIndex(x => x === headerinfo.dest_connection_id) !== -1){
                    foundindex = index;
                    el.packets.push(packet)

                    let src_conn_id= (<LongHeader> headerinfo).src_connection_id
                    //check if SCID has changed, if so change value of CID for that endpoint
                    if (headerinfo.header_form === 1 && src_conn_id && el.CID_endpoint1!.findIndex(x => x === src_conn_id) === -1) {
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

    private createConnection(packetinfo: Array<string>, connloginfo: LogConnectionInfo, connections: Array<QuicConnection>): number{
        let splitline
        let connection: QuicConnection

        if (packetinfo.length > 2){ 
            let el = packetinfo[2]
            splitline = el.split(" ")
        

            connloginfo.version = '0xff00000b'
            connection = {
                CID_endpoint1: Array(this.parseCID(splitline[1]), this.parseCID(this.splitOnSymbol(splitline[5], "="))),
                CID_endpoint2: Array(this.parseCID(this.splitOnSymbol(splitline[6], "="))),
                packets: Array<QuicPacket>()
            }
        }
        else{
            let el = packetinfo[0]
            splitline = el.split(" ")
        
            connloginfo.version = '0xff00000b'
            connection = {
                CID_endpoint1: Array(this.parseCID(splitline[1])),
                CID_endpoint2: Array(),
                packets: Array<QuicPacket>()
            }
        }
        return connections.push(connection) - 1
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

    private isNewConnectionId(payload: New_Connection_Id | Payload): payload is New_Connection_Id {
        return (<New_Connection_Id>payload).connection_id !== undefined;
    }
}