import TableInterface from "@/data/frametables/TableInterface";
import { Frametypes, FrameColour } from "@/data/frametables/Frametypes";

export default class DefaultTable implements TableInterface{
    private _name: string;
    private _colortable: Array<FrameColour>;

    constructor() {
        this._name = 'Default';
        this._colortable = new Array();
        this.setInitialColours()
    }

    private setInitialColours(){
        this._colortable.push({
            framecode: Frametypes.PADDING,
            colour: "#30343a"
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
            colour: "#5f0984"
        })
        
        this._colortable.push({
            framecode: Frametypes.MAX_STREAM_DATA,
            colour: "#551172"
        })

        this._colortable.push({
            framecode: Frametypes.MAX_STREAM_ID,
            colour: "#4a1460"
        })
        
        this._colortable.push({
            framecode: Frametypes.PING,
            colour: "#c6c914"
        })
        
        this._colortable.push({
            framecode: Frametypes.BLOCKED,
            colour: "#650b7a"
        })
        
        this._colortable.push({
            framecode: Frametypes.STREAM_BLOCKED,
            colour: "#650b7a"
        })
        

        this._colortable.push({
            framecode: Frametypes.STREAM_ID_BLOCKED,
            colour: "#650b7a"
        })

        this._colortable.push({
            framecode: Frametypes.NEW_CONNECTION_ID,
            colour: "#068484"
        })
        
        this._colortable.push({
            framecode: Frametypes.STOP_SENDING,
            colour: "#a80106"
        })
        
        this._colortable.push({
            framecode: Frametypes.ACK,
            colour: "#03ad25"
        })
        
        this._colortable.push({
            framecode: Frametypes.PATH_CHALLENGE,
            colour: "#d6dd02"
        })
        
        this._colortable.push({
            framecode: Frametypes.PATH_RESPONSE,
            colour: "#d6dd02"
        })
        
        this._colortable.push({
            framecode: Frametypes.STREAM,
            colour: "#0468cc"
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