import * as d3 from "d3";

export default class TimeSettings{
    private _scale: d3.ScaleLinear<number, number>

    constructor(){
        this._scale = d3.scaleLinear()
    }

    public initScale(maxWidth: number, startdom: number, enddom: number){
        this._scale = d3.scaleLinear().range([0, maxWidth]).domain([startdom,enddom])
    }

    public getScale(): d3.ScaleLinear<number, number>{
        return this._scale
    }

    public setDomain(startdom: number, enddom: number){
        this._scale.domain([startdom, enddom])
    }
}