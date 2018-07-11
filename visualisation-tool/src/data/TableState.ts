export interface TableHeader{
    name: string,
    packet_key: string,
    filtered: boolean
}

export default class TableState{
    private _filteredheaders: Array<TableHeader>;

    constructor(){
        this._filteredheaders = new Array()
        this.initHeaders()
    }

    private initHeaders(){
        this._filteredheaders.push({name: 'Header',packet_key: 'header_form', filtered: false});
        this._filteredheaders.push({name: 'DCID',packet_key: 'dest_connection_id', filtered: false});
        
        //long header
        this._filteredheaders.push({name: 'L_packet type',packet_key: 'long_packet_type', filtered: false});
        this._filteredheaders.push({name: 'SCID',packet_key: 'src_connection_id', filtered: false});
        this._filteredheaders.push({name: 'Version',packet_key: 'version', filtered: false});
        this._filteredheaders.push({name: 'PN',packet_key: 'packet_number', filtered: false});

        //short header
        this._filteredheaders.push({name: 'OC flag',packet_key: 'omit_conn_id', filtered: false});
        this._filteredheaders.push({name: 'KP flag',packet_key: 'key_phase', filtered: false});
        this._filteredheaders.push({name: 'S_packet type',packet_key: 'short_packet_type', filtered: false});
    }

    public getTableHeaders(): Array<TableHeader>{
        return this._filteredheaders
    }
}