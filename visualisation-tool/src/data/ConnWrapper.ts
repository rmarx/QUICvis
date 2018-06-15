import { QuicConnection, QuicPacket } from "@/data/quic";

export default class ConnWrapper{
    private _conn: QuicConnection;

    private _isfilteredout: boolean;

    private _backgroundcolour: string;

    private _filteredstreams: Array<boolean>;

    private _selectedPacket: QuicPacket|null;

    private _showStreams: boolean;

    public constructor(conn: QuicConnection){
        this._conn = conn
        this._isfilteredout = false
        this._backgroundcolour = "#ff00ff"
        this._filteredstreams = Array()
        this._selectedPacket = null
        this._showStreams = false
    }

    public getConn(): QuicConnection{
        return this._conn
    }

    public setConn(newconn: QuicConnection): void{
        this._conn = newconn;
    }

    public getIsFiltered(): boolean{
        return this._isfilteredout;
    }

    public invertIsFiltered(){
        this._isfilteredout = this._isfilteredout === false ? true : false
    }

    public getBgColor(): string{
        return this._backgroundcolour
    }

    public setBgColor(value: string){
        this._backgroundcolour = value
    }
}