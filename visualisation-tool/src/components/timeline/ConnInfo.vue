<!-- This file creates one row for one connection and its streams to the left in the TIMELINE view -->
<!-- This is bundled in ConnectionInfoList for multiple connections -->

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
                
                <button class="btn btn-secondary btn-sm" @click="resetStreamFilters()">Reset hidden</button>
                <div class="w-100 x-offset float-left">
                    <label class="w-25" v-bind:for="'x-offset-' + traceid + connid">X0</label>
                    <input  class="w-75" type="number" v-model="xoffset" v-bind:id="'x-offset-' + traceid + connid" @change="setXOffset()" min="0">
                </div>
            </div>
        </div>
        <div class="border" v-for="stream in filteredstreams" v-if="!stream.filtered && showstreams" v-bind:key="stream.streamnr" v-bind:style="{height: streamheight + 'px', 
        'background-color': bgcolor(stream.cl_init, stream.uni_di)}">
                <div v-if="stream.streamnr != 0" class="stream_name float-right">Stream {{ stream.streamnr }} </div>
                <div v-if="stream.streamnr == 0" class="stream_name float-right">Control</div>
                <button class="btn btn-primary btn-sm float-left filter-button" style="line-height: 1; padding: 0 5%;" @click="filterStream(stream.streamnr)" >Hide</button>
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
            streamheight: 30,
            xoffset: 0
        }
    },
    computed: {
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
        resetStreamFilters() {
            let data = {
                traceid: this.traceid,
                connid: this.connid,
            }
            this.$store.dispatch('resetStreamFilters', data);
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
        },
        filterStream(streamnr: number) {
            let data = {
                traceid: this.traceid,
                connid: this.connid,
                streamnr: streamnr
            }
            this.$store.dispatch('filterStream', data)
        },
        bgcolor(cl_init: boolean, uni_di: boolean) {
            return this.$store.state.vissettings.getStreamColor(cl_init, uni_di);
        }
    },
    mounted() {
        this.colorvalue = this.bgcolor
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

.stream_name{
    text-align: center;
    padding-right: 10px;
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
    background-color: lightgray;
}

.filter-button{
    height: 30px;
}
</style>

