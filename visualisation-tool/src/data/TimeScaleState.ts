import * as d3 from 'd3';
import { runInContext } from 'vm';

export default class TimeScaleState{
    private _width: number;
    private _height: number;
    
    private _start: number;
    private _end: number;

    private _zoom: d3.ZoomBehavior<Element, {}>;
    private _zoomTransform: d3.ZoomTransform;

    private _refscale: d3.ScaleLinear<number, number>;
    private _scale: d3.ScaleLinear<number, number>;

    constructor(){
        this._width = 0;
        this._height = 0;

        this._start = 0;
        this._end = 100;

        this._refscale = d3.scaleLinear().domain([this._start, this._end]).range([0,0]).nice()
        this._scale = this._refscale;

        this._zoomTransform = d3.zoomIdentity;
        this._zoom = d3.zoom().scaleExtent([1,400]).on("zoom", () => {
            this._zoomTransform = d3.event.transform;
            this._scale = this._zoomTransform.rescaleX(this._refscale);
        })
    }

    public setDimensions(width: number, height: number) {
        if (width === this._width && height === this._height) return;

        this._width = width;
        this._height = height;

        this._refscale.range([0, width]);
        this._scale = this._zoomTransform.rescaleX(this._refscale);
        this._zoom.extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]);
    }

    public getScale(): d3.ScaleLinear<number, number>{
        return this._scale
    }

    public getZoom(): d3.ZoomBehavior<Element, {}>{
        return this._zoom
    }

    public setDomain(start, end){
        this._start = start
        this._end = end

        this._refscale.domain([start, end])
        this._scale = this._zoomTransform.rescaleX(this._refscale);
    }

    public getDomain(): Array<number>{
        return [this._start, this._end]
    }
}