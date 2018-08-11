import Parser from "./parser"
import {
    Trace, QuicConnection, QuicPacket, Header, LongHeader, ShortHeader,
    Payload, Frame, Padding, Rst_Stream, Application_Close, Max_Data, Max_Stream_Data, Max_Stream_Id, Ping, Blocked, Stream_Blocked, 
    Stream_Id_Blocked, New_Connection_Id, Stop_Sending, Ack, Path_Challenge, Path_Response, Stream, Connection_Close, AckBlock, ServerInfo
} from "../data/quic"


export class QuickerLogParser extends Parser{
    public parse(name: string, tracefile: any): Trace{
        let trace = this.createTraceObject(name)
        tracefile = this.removeEscapeCharacters(tracefile)
        let packets = this.divideTextByPackets(tracefile)
        
        return trace
    }

    private removeEscapeCharacters(tracefile: string): string{
        let filteredfile = tracefile.replace(/\[.../g, "");
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

}