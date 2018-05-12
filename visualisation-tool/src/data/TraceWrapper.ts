import { Trace, QuicConnection } from "./quic"
import ConnWrapper from "@/data/ConnWrapper";

export default class TraceWrapper{
    private _trace: Trace
    private _conns: Array<ConnWrapper>


    public constructor(){
        let dummytrace: Trace = {
            name: "",
            connection: null
        }
        this._trace = dummytrace
        this._conns = Array()
    }

    public getTrace(): Trace{
        return this._trace
    }

    public setTrace(newtrace: Trace): void{
        this._trace = newtrace;
        this.setConns()
    }

    private setConns(){
        let conndata = this._trace.connection

        this._conns = Array()
        if (conndata){
            conndata.forEach((el) => {
                this._conns.push(new ConnWrapper(el))
            })
        }
    }

    public getConns(): Array<ConnWrapper>{
        return this._conns;
    }
}