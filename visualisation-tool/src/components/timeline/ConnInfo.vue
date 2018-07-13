<template>
    <div class="conncontainer">
        <div class="d-flex h-100" v-bind:style="{ height: compheight + 'px'}">
            <div class="conn_name float-left border" v-bind:style="{height: connheight + 'px'}">
                {{ 'conn' + (connid + 1)}}
                <button class="btn btn-sm btn-primary" 
                type="button" data-toggle="collapse" v-bind:data-target="'#connsettings' + traceid + connid" aria-expanded="false" v-bind:aria-controls="'connsettings' + traceid + connid">
                &lt;&lt;
                </button>
            </div> 
            <div class="float-left border collapse overlap" v-bind:id="'connsettings' + traceid + connid">
                <input type="color" class="colorpicker" v-bind:id="'backgroundcolor' + traceid + connid" v-model="colorvalue" @change="setBgColor">
                <multiselect v-model="selectedstreams" :options="streamoptions" :multiple="true" :close-on-select="false" label="streamnr" track-by="streamnr" @close="setSelectStreamFilters"/>
                <button class="btn btn-primary btn-sm" @click="setShowStreams()">Show streams</button>
            </div>
        </div>
        <div class="conn_name border" v-for="stream in filteredstreams" v-if="!stream.filtered && showstreams" v-bind:style="{height: streamheight + 'px', 'background-color': bgcolor}">
                Stream {{ stream.streamnr}}
        </div> 
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Multiselect from 'vue-multiselect'
export default {
    name: "conninfo",
    props: ['traceid', 'connid'],
    data() {
        return {
            colorvalue: '',
            selectedstreams: null,
            streamoptions: [],
            connheight: 62,
            streamheight: 60
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
        setBgColor: function(){
            let data = {
                traceid: this.traceid,
                connid: this.connid,
                color: this.colorvalue
            }
            this.$store.dispatch('setBgColor', data)
        },
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
        }
    },
    mounted() {
        this.colorvalue = this.bgcolor
        this.updateFilteredStreams()
    },
    components: {
        Multiselect
    }
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

.colorpicker{
    width: 50px;
    height: 20px;
}

.overlap{
    position: absolute;
    width: 256px;
    margin-left: 50px;
    background-color: black;
    height: 100px;
}
</style>

