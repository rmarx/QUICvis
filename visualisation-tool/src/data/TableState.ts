export interface TableHeader{
    name: string,
    filtered: boolean
}

export default class TableState{
    private _filteredheaders: Array<TableHeader>;

    constructor(){
        this._filteredheaders = new Array()
        this.initHeaders()
    }

    private initHeaders(){
        this._filteredheaders.push({name: 'header_form', filtered: false});
        this._filteredheaders.push({name: 'dest_connection_id', filtered: false});
        
        //long header
        this._filteredheaders.push({name: 'long_packet_type', filtered: false});
        this._filteredheaders.push({name: 'src_connection_id', filtered: false});
        this._filteredheaders.push({name: 'version', filtered: false});
        this._filteredheaders.push({name: 'packet_number', filtered: false});

        //short header
        this._filteredheaders.push({name: 'omit_conn_id', filtered: false});
        this._filteredheaders.push({name: 'key_phase', filtered: false});
        this._filteredheaders.push({name: 'short_packet_type', filtered: false});
    }

    public getTableHeaders(): Array<TableHeader>{
        return this._filteredheaders
    }
}