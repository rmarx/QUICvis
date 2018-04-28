import { Trace } from "./quic"

export default class TraceWrapper{
    private _trace: Trace


    public constructor(){
        let dummytrace: Trace = {
            name: "",
            connection: null
        }
        this._trace = dummytrace
    }

    public getTrace(): Trace{
        return this._trace
    }

    public setTrace(newtrace: Trace): void{
        this._trace = newtrace;
    }
}