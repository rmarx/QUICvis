import * as d3 from 'd3';
import {event as currentEvent} from 'd3-selection';
import { runInContext } from 'vm';
import Vue from 'vue';
import _ from 'lodash'

export default class TimeScaleState{
    private _width: number;
    private _height: number;
    
    private _start: number;
    private _end: number;

    private _zoom: any;
    private _zoomTransform: d3.ZoomTransform;

    private _refscale: d3.ScaleLinear<number, number>;
    private _scale: d3.ScaleLinear<number, number>;

    private _timeaxis: any;
    private _gaxis: any;

    private _movables: Array<any>;
    private _zoomables: Array<any>;

    constructor(){
        this._width = 1720;
        this._height = 500;

        this._start = 0;
        this._end = 20;

        this._refscale = d3.scaleLinear().domain([this._start, this._end]).range([0,0]).nice();
        this._scale = this._refscale;

        this._zoomTransform = d3.zoomIdentity;
        this._zoom = null;

        this._timeaxis = null;
        this._gaxis = null;

        this._movables  = new Array<any>();
        this._zoomables = new Array<any>();
    }
    
    // things that need to move when we zoom/pan
    // these are the StreamBlocks and PacketBlocks 
    // we assume movables to be VUE components (e.g., having .$el and .$options.methods)
    public addMovableOnZoom(movable: any){
        this._movables.push(movable);
    }

    // things that need to share the same zoom context
    // this is typically the svg backgrounds / lanes (red and green) and the timeline itself
    // we assume zoomables to be HTMLElements themselves (e.g., the raw SVG elements)
    public addZoomable(zoomable: any){
        this._zoomables.push(zoomable);
    }

    public setZoom(){

        let svgcont = d3.select("#timelinesvg");
        this._timeaxis = d3.axisTop(this._scale);
        this._timeaxis.tickSizeOuter(0);
        this._timeaxis.tickSizeInner(- 100000); // make ticks descend all the way down, forming a visual ~grid

        // Movables:
        // Before, the movables all just used Vue reactivity bindings to get their updates whenever we zoomed
        // however, this was extremely slow, as we have thousands of individual packet-block renderers that all need to be moved
        // so, instead, these many elements have to register with us here 
        // and we update the SVG transform manually, instead of via Vue bindings, which is much much slower 
        // Zoomables:
        // Because of the way we currently register zoom event listeners 
        // (on each SVG background and the timeline separately vs on a single overlapping container)
        // we need to keep their zoom contexts in-sync.
        // If we don't do this, and you start scrolling/panning on 1 svg element, then moved to another, the zooming would jump around
        // because we would suddenly have other reference transforms. 
        // TODO: refactor into 1 big zoom listener overlay 
        let zoomMovables = () => {
            for( let movable of this._movables ){
                movable.$options.methods.updateXAfterZoom.bind(movable)( this._scale );
            }

            for( let zoomable of this._zoomables ){
                zoomable.__zoom = this._zoomTransform;
            }
        };

        // scrolling/panning triggers zoom multiple times. 
        // Since moving the movables is a slow operation (many thousands of them), we debounce it, 
        // to make sure it only triggers once every 50ms.
        // However, when panning, the update rate is a lot higher, and at 50ms lag, this looks very very sloppy
        // so we update the rate UP when panning, but keep low when zooming (much less noticeable)
        let debouncedZoomMovables = _.debounce( zoomMovables, 50 );
        let debouncedPanMovables  = _.debounce( zoomMovables, 5 ); 


        this._zoom = d3.zoom().scaleExtent([1,400]).on("zoom", () => {
            
            this._zoomTransform = d3.event.transform;

            this._scale = this._zoomTransform.rescaleX(this._refscale);

            if (this._timeaxis){
                this._timeaxis.scale(this._scale);
                this._gaxis.call(this._timeaxis);
            }

            let newdomain = this._timeaxis!.scale().domain();
            this._start = newdomain[0];
            this._end = newdomain[1];

            setTimeout( () => {
                // @ts-ignore
                console.log("zoomUpdate count ", window.zoomUpdateCount, window.betterZoomUpdateCount);
                // @ts-ignore
                window.zoomUpdateCount = 0;
                // @ts-ignore
                window.betterZoomUpdateCount = 0;
            }, 500);

            if( d3.event.sourceEvent && d3.event.sourceEvent instanceof MouseEvent)
                debouncedPanMovables();
            else
                debouncedZoomMovables(); // WheelEvent
        });

        this._gaxis = svgcont
            .append("g")
            .attr("class", "timeaxis")
            .call(this._timeaxis);
        
        // make sure we can also scroll on the timeline grid and axis themselves
        svgcont.call(this._zoom).on("wheel", function() { d3.event.preventDefault(); }); 

        // make sure the time axis shares the zoomcontext
        this.addZoomable( this._gaxis );
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
        return this._scale(time)
    }

    public getScaler(): d3.ScaleLinear<number, number>{
        return this._scale;
    }

}