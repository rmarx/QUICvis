<template>
    <div>
        <div class="d-flex" v-bind:style="{ height: compheight + 'px', width: compwidth + 'px'}">
            <div class="conn_name h-100 float-left border">
                {{ 'conn' + (connid + 1)}}
                <button class="btn btn-sm btn-primary" 
                type="button" data-toggle="collapse" v-bind:data-target="'#connsettings' + traceid + connid" aria-expanded="false" v-bind:aria-controls="'connsettings' + traceid + connid">
                &lt;&lt;
                </button>
            </div>
            <div class="h-100 float-left border collapse" v-bind:id="'connsettings' + traceid + connid">
                <input type="color" class="colorpicker" v-bind:id="'backgroundcolor' + traceid + connid" v-model="colorvalue" @change="setBgColor">
            </div>
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
            compheight: 120,
            compwidth: 25,
            colorvalue: ''
        }
    },
    computed: {
        bgcolor() {
            return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getBgColor();
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
        }
    },
    mounted() {
        this.colorvalue = this.bgcolor
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
</style>