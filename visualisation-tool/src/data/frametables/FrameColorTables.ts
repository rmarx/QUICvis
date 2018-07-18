import TableInterface from "@/data/frametables/TableInterface";
import DefaultTable from "@/data/frametables/DefaultTable";
import FCTable from "@/data/frametables/FCTable";
import ErrorTable from "@/data/frametables/ErrorTable";

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

    public getFrameColour(frametype: number): string{
        return this._colortables[this._activeindex].findColor(frametype);
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
}