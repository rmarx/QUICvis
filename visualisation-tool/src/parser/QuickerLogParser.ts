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
        packets_string.forEach((packet) => {
            this.parsePacket(packet, starttime)
        })
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

    private parsePacket(packet_string: string, starttime: number){
        let splitstring = packet_string.split('\n')
        let conn_info = this.parseConnectionInfo(splitstring[0], starttime)
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
}