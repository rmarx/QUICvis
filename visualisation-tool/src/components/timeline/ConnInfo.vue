<template>
    <div class="conncontainer">
        <div class="d-flex h-100" v-bind:style="{ height: compheight + 'px'}">
            <div class="conn_name float-left border" v-bind:style="{height: connheight + 'px'}">
                {{ 'conn' + (connid + 1)}}
            </div> 
            <div class="float-left border" v-bind:id="'connsettings' + traceid + connid">
                <!--<select class="selectpicker" multiple>
                </select>-->
                <button class="btn btn-primary btn-sm" @click="setShowStreams()" v-if="!showstreams">E</button>
                <button class="btn btn-primary btn-sm" @click="setShowStreams()" v-else>C</button>
                <div class="w-100 x-offset float-left">
                    <label class="w-25" v-bind:for="'x-offset-' + traceid + connid">X0</label>
                    <input  class="w-75" type="number" v-model="xoffset" v-bind:id="'x-offset-' + traceid + connid" @change="setXOffset()" min="0">
                </div>
            </div>
        </div>
        <div class="conn_name border" v-for="stream in filteredstreams" v-if="!stream.filtered && showstreams" v-bind:style="{height: streamheight + 'px', 'background-color': bgcolor}">
                Stream {{ stream.streamnr}}
        </div> 
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default {
    name: "conninfo",
    props: ['traceid', 'connid'],
    data() {
        return {
            selectedstreams: null,
            streamoptions: [],
            connheight: 62,
            streamheight: 60,
            xoffset: 0
        }
    },
    computed: {
        bgcolor() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getBgColor();
        },
        compheight() {
            let height = 0
            if (this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getShowStreams()) {
                height +=  60 * this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getAmountStreamsToShow();
            }
            return height + 122;
        },
        filteredstreams() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getStreamFilters()
        },
        showstreams(){
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getShowStreams()
        }
    },
    methods: {
        updateFilteredStreams: function() {
            let streamfilters = this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getStreamFilters(this.traceid, this.connid)
            
            let tempoptions = new Array<{streamnr: number}>()
            streamfilters.forEach((element) => {
                tempoptions.push({streamnr: element['streamnr']})
            });

            this.streamoptions = tempoptions
        },
        setSelectStreamFilters(selectedoptions){
            let tofilter = new Array<number>()
            selectedoptions.forEach((el) => {
                tofilter.push(el['streamnr'])
            })
            let data = {
                traceid: this.traceid,
                connid: this.connid,
                tofilter: tofilter
            }
            this.$store.dispatch('setFilteredStreams', data)
        },
        setShowStreams(){
            let data = {
                traceid: this.traceid,
                connid: this.connid
            }
            this.$store.dispatch('toggleShowStreams', data);
        },
        setXOffset(){
            let data = {
                traceid: this.traceid,
                connid: this.connid,
                xoffset: this.xoffset
            }
            this.$store.dispatch('setXOffset', data)
        }
    },
    mounted() {
        this.colorvalue = this.bgcolor
        this.updateFilteredStreams()
    },
}
</script>
<style>
.conn_name{
    writing-mode: vertical-rl;
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    text-align: center;
}

.overlap{
    position: absolute;
    width: 256px;
    margin-left: 50px;
    background-color: black;
    height: 100px;
}

.x-offset{
    height: 20px;
}
</style>

