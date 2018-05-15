import TraceWrapper from "@/data/TraceWrapper";

export interface FrameColour{
    framecode: number,
    colour: string
}

export enum Frametypes{
    PADDING = 0x00,
    RST_STREAM = 0x01,
    CONNECTION_CLOSE = 0x02,
    APPLICATION_CLOSE = 0x03, 
    MAX_DATA = 0x04, 
    MAX_STREAM_DATA = 0x05, 
    MAX_STREAM_ID = 0x06,
    PING = 0x07,
    BLOCKED = 0x08,
    STREAM_BLOCKED = 0x09,
    STREAM_ID_BLOCKED = 0x0a,
    NEW_CONNECTION_ID = 0x0b,
    STOP_SENDING = 0x0c,
    ACK = 0x0d,
    PATH_CHALLENGE = 0x0e,
    PATH_RESPONSE = 0x0f,
    STREAM = 0x10
}

export default class VisSettings{
    private _files: Array<TraceWrapper>
    private _framecolours: Array<FrameColour>


    public constructor(){
        this._files = Array()
        this._framecolours = Array()
        this.setInitialColours()
    }

    private setInitialColours(){
        this._framecolours.push({
            framecode: Frametypes.PADDING,
            colour: "#730000"
        })

        this._framecolours.push({
            framecode: Frametypes.RST_STREAM,
            colour: "#402020"
        })

        this._framecolours.push({
            framecode: Frametypes.CONNECTION_CLOSE,
            colour: "#664d4d"
        })
        
        this._framecolours.push({
            framecode: Frametypes.APPLICATION_CLOSE,
            colour: "#f2553d"
        })
        
        this._framecolours.push({
            framecode: Frametypes.MAX_DATA,
            colour: "#8c4f46"
        })
        
        this._framecolours.push({
            framecode: Frametypes.MAX_STREAM_DATA,
            colour: "#bf9c8f"
        })

        this._framecolours.push({
            framecode: Frametypes.MAX_STREAM_ID,
            colour: "#b2622d"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PING,
            colour: "#331b00"
        })
        
        this._framecolours.push({
            framecode: Frametypes.BLOCKED,
            colour: "#593a16"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STREAM_BLOCKED,
            colour: "#cc8800"
        })
        

        this._framecolours.push({
            framecode: Frametypes.STREAM_ID_BLOCKED,
            colour: "#8c7723"
        })

        this._framecolours.push({
            framecode: Frametypes.NEW_CONNECTION_ID,
            colour: "#bfb68f"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STOP_SENDING,
            colour: "#f2ea79"
        })
        
        this._framecolours.push({
            framecode: Frametypes.ACK,
            colour: "#ccff00"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PATH_CHALLENGE,
            colour: "#708c00"
        })
        
        this._framecolours.push({
            framecode: Frametypes.PATH_RESPONSE,
            colour: "#143300"
        })
        
        this._framecolours.push({
            framecode: Frametypes.STREAM,
            colour: "#b8d9a3"
        })
    }

    public getFile(index: number): TraceWrapper{
        return this._files[index]
    }

    public addFile(newfile: TraceWrapper): void{
        this._files.push(newfile);
    }

    public removeFile(index): void{
        this._files.splice(index, 1);
    }

    public getAllFiles(): Array<TraceWrapper>{
        return this._files
    }
}