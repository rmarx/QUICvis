import { Trace, QuicConnection } from "./quic"
import ConnWrapper from "@/data/ConnWrapper";

export default class TraceWrapper {
    private _trace: Trace
    private _conns: Array<ConnWrapper>


    public constructor() {
        let dummytrace: Trace = {
            name: "",
            connection: null
        }
        this._trace = dummytrace
        this._conns = Array()
    }

    public getTrace(): Trace {
        return this._trace
    }

    public setTrace(newtrace: Trace, colorindex: number, colors: Array<string>): number {
        this._trace = newtrace;
        colorindex = this.setConns(colorindex, colors)
        return colorindex
    }

    private setConns(colorindex: number, colors: Array<string>): number {
        let conndata = this._trace.connection

        this._conns = Array()
        if (conndata) {
            conndata.forEach((el) => {
                this._conns.push(new ConnWrapper(el, colors[colorindex]))
                colorindex += 1;
                colorindex = colorindex % (colors.length - 1)
            })
        }
        return colorindex
    }

    public getConns(): Array<ConnWrapper> {
        return this._conns;
    }

    public getAmountConns(): number {
        return this._conns.length
    }

    public getTraceName(): string {
        return this._trace.name
    }

    public getConnFilters(): Array<boolean> {
        let filters = Array<boolean>()
        this._conns.forEach((el) => {
            filters.push(el.getIsFiltered())
        })
        return filters
    }

    public getConn(index: number): ConnWrapper {
        return this._conns[index]
    }

    public getFilteredConns(): Array<number> {
        let conns = new Array<number>()
        this._conns.forEach((el, index) => {
            if (!el.getIsFiltered())
                conns.push(index)
        })
        return conns
    }

    public getAmountStreamsToShow(): Array<{conn: number, streams: number}>{
        let amount = new Array<{conn: number, streams: number}>()
        this._conns.forEach((conn, id) => {
            if (!conn.getIsFiltered()) {
                if (conn.getShowStreams())
                    amount.push({conn: id, streams: conn.getAmountStreamsToShow()})
                else
                    amount.push({conn: id, streams: -1})
            }
        })
        return amount
    }

    public removeConns(){
        this._conns.splice(0, this._conns.length-1)
    }
}