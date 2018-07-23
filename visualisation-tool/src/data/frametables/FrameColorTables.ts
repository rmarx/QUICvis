import TableInterface from "@/data/frametables/TableInterface";
import DefaultTable from "@/data/frametables/DefaultTable";
import FCTable from "@/data/frametables/FCTable";
import ErrorTable from "@/data/frametables/ErrorTable";
import { Frametypes, FrameColour } from "@/data/frametables/Frametypes";

export default class FrameColorTables{
    private _colortables: Array<TableInterface>
    private _activeindex: number;

    constructor(){
        this._colortables = new Array()
        this._activeindex = 0;
        this._colortables.push(new DefaultTable())
        this._colortables.push(new FCTable())
        this._colortables.push(new ErrorTable())
    }

    public getFrameColour(frametypes: Array<string>): string{
        let color = '#ffffff'
        for (let i = 0; i < frametypes.length && color === '#ffffff'; i++) {
            let framecode = parseInt(frametypes[i])
            if (framecode > Frametypes.STREAM)
                framecode = Frametypes.STREAM
            color = this._colortables[this._activeindex].findColor(framecode);
        }
        return color;
    }

    public switchTable(name: string){
        let found = false;
        for (let i = 0; i < this._colortables.length; i++) {
            if (this._colortables[i].getName() === name){
                this._activeindex = i;
                found = true;
                break;
            }
        }
        
        if (!found)
            this._activeindex = 0;
    }

    public getAllTableNames(): Array<string>{
        let names = new Array<string>()
        for (let i = 0; i < this._colortables.length; i++) {
            names.push(this._colortables[i].getName())
        }
        return names
    }

    public getSelectedTableName(): string {
        return this._colortables[this._activeindex].getName()
    }

    public getAllFrameColours(): Array<FrameColour>{
        return this._colortables[this._activeindex].getAllColors()
    }
}