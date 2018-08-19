<template>
    <div v-if="packet_conn !== null && packet_conn.serverinfo !== null" class="serverinfocontainer" :style="{top: (ytranslate + baseheight - 20) + 'px', left: lefttrans + 'px'}">
        <button v-if="!expanded" class="btn btn-sm btn-primary position-absolute" @click="toggleSeverInfo()" :style="{left: buttontrans +'px'}">+</button>
        <button v-if="expanded" class="btn btn-sm position-absolute" @click="toggleSeverInfo()" :style="{left: buttontrans +'px'}">-</button>
        <div class="collapse">
        <div v-for="info in packet_conn.serverinfo">
            <div class="float-left">
                {{info.infotype}}:
            </div>
            <div class="float-left">
                {{info.infocontent}}
            </div>
            <br />
        </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default {
    name: "ServerInfo",
    props: ['packet_conn', 'baseheight', 'isclient', 'start_time', '_2filesused'],
    data() {
        return {
            expanded: false
        }
    },
    computed: {
        scale() {
            return this.$store.state.sequencesettings.getTimeScale()
        },
        rtt_amount(){
            return this.$store.state.sequencesettings.get1filertt()
        },
        ytranslate(){
            if (this._2filesused) {
                let t_p1 = parseFloat(this.packet_conn.connectioninfo.time_delta)
                let t_p2 = parseFloat(this.packet_conn.connectioninfo.time_delta) + ((this.rtt_amount / 2) / 1000)

                if (this.isclient)
                    return t_p1 * 1000 * this.scale
                else
                    return ((t_p2 * 1000)  * this.scale)
            }
            if (this.start_time > 0)
                return parseFloat(this.start_time) * this.scale
            else
                return parseFloat(this.packet_conn.connectioninfo.time_delta) * 1000 * this.scale
        },
        lefttrans(){
            if (this.isclient)
                return -250
            else
                return 1000
        },
        buttontrans(){
            if (this.isclient)
                return 270
            else
                return -60       
        }
    },
    methods: {
        toggleSeverInfo(){
            let serverinfo = ( <HTMLElement> this.$el).children[1]
            if (serverinfo.classList.contains('show'))
                serverinfo.classList.remove('show')
            else
                serverinfo.classList.add('show')
            this.expanded = !this.expanded
        }
    },
}
</script>
<style>
.serverinfocontainer{
    position: absolute;
}
</style>
