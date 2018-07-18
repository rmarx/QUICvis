import TableInterface from "@/data/frametables/TableInterface";
import { Frametypes, FrameColour } from "@/data/frametables/Frametypes";

export default class ErrorTable implements TableInterface{
    private _name: string;
    private _colortable: Array<FrameColour>;

    constructor() {
        this._name = 'Errors';
        this._colortable = new Array();
        this.setInitialColours()
    }

    private setInitialColours(){
        this._colortable.push({
            framecode: Frametypes.PADDING,
            colour: "#ffffff"
        })
        this._colortable.push({
            framecode: Frametypes.RST_STREAM,
            colour: "#870c12"
        })

        this._colortable.push({
            framecode: Frametypes.CONNECTION_CLOSE,
            colour: "#a80f3a"
        })
        
        this._colortable.push({
            framecode: Frametypes.APPLICATION_CLOSE,
            colour: "#961010"
        })
        
        this._colortable.push({
            framecode: Frametypes.MAX_DATA,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.MAX_STREAM_DATA,
            colour: "#ffffff"
        })

        this._colortable.push({
            framecode: Frametypes.MAX_STREAM_ID,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.PING,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.BLOCKED,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.STREAM_BLOCKED,
            colour: "#ffffff"
        })
        

        this._colortable.push({
            framecode: Frametypes.STREAM_ID_BLOCKED,
            colour: "#ffffff"
        })

        this._colortable.push({
            framecode: Frametypes.NEW_CONNECTION_ID,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.STOP_SENDING,
            colour: "#a80106"
        })
        
        this._colortable.push({
            framecode: Frametypes.ACK,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.PATH_CHALLENGE,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.PATH_RESPONSE,
            colour: "#ffffff"
        })
        
        this._colortable.push({
            framecode: Frametypes.STREAM,
            colour: "#ffffff"
        })
    }

    public getName(): string{
        return this._name
    }

    public findColor(framecode: number): string{
        for (let i = 0; i < this._colortable.length; i++) {
            if (this._colortable[i].framecode === framecode)
                return this._colortable[i].colour
        }

        return '#ffffff';
    }
}