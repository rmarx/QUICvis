import * as d3 from 'd3';
import { runInContext } from 'vm';
import Vue from 'vue';

export default class TimeScaleState{
    private _width: number;
    private _height: number;
    
    private _start: number;
    private _end: number;

    private _zoom: d3.ZoomBehavior<Element, {}>|null;
    private _zoomTransform: d3.ZoomTransform;

    private _refscale: d3.ScaleLinear<number, number>;
    private _scale: d3.ScaleLinear<number, number>;

    private _timeaxis: d3.Axis<d3.AxisDomain>|null;
    private _gaxis: d3.Selection<d3.BaseType, {}, HTMLElement, any>|null;

    constructor(){
        this._width = 0;
        this._height = 0;

        this._start = 0;
        this._end = 100;

        this._refscale = d3.scaleLinear().domain([this._start, this._end]).range([0,0]).nice()
        this._scale = this._refscale;

        this._zoomTransform = d3.zoomIdentity;
        this._zoom = null

        this._timeaxis = null
        this._gaxis = null
    }

    public setZoom(){
        let svgcont = d3
            .select("#timelinesvg")
        this._timeaxis = d3.axisTop(this._scale);
        this._timeaxis.tickSizeOuter(0);
        this._timeaxis.tickSizeInner(- (window.innerHeight * (3/5)))
        this._zoom = d3.zoom().scaleExtent([1,400]).on("zoom", () => {
            this._zoomTransform = d3.event.transform;
            this._scale = this._zoomTransform.rescaleX(this._refscale)
            this._timeaxis!.scale(d3.event.transform.rescaleX(this._scale));
            this._gaxis.call(this._timeaxis);

            let newdomain = this._timeaxis!.scale().domain()
            this._start = newdomain[0];
            this._end = newdomain[1];
        })
        this._gaxis = svgcont
            .append("g")
            .attr("class", "timeaxis")
            .call(this._timeaxis);
            svgcont.call(this._zoom);
    }

    public setDimensions(width: number, height: number) {
        if (width === this._width && height === this._height) return;

        this._width = width;
        this._height = height;

        this._refscale.range([0, width]);
        this._scale = this._zoomTransform.rescaleX(this._refscale);
        this._zoom.extent([[0, 0], [width, height]]).translateExtent([[0, 0], [width, height]]);
        this._gaxis.call(this._zoom.transform, d3.zoomIdentity)
    }

    public getScale(): d3.ScaleLinear<number, number>{
        return this._scale
    }

    public getZoom(): d3.ZoomBehavior<Element, {}>|null{
        return this._zoom
    }

    public setDomain(start, end){
        this._start = start
        this._end = end

        this._refscale.domain([start, end])
        this._scale = this._zoomTransform.rescaleX(this._refscale);
        this._gaxis.call(this._zoom.transform, d3.zoomIdentity)
    }

    public getStartDomain(): number{
        return this._scale.domain()[0]
    }

    public getEndDomain(): number{
        return this._scale.domain()[1]
    }

    public calcTranslateX(time: number): number{
        return this._scale(time - this._start)
    }
}