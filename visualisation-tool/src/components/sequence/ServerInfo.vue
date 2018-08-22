<template>
    <div v-if="packet_conn !== null && packet_conn.serverinfo !== null" class="serverinfocontainer" :style="{top: (ytranslate-20) + 'px', left: lefttrans + 'px'}">
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
    props: ['packet_conn', 'ytranslate', 'isclient'],
    data() {
        return {
            expanded: false
        }
    },
    computed: {
        lefttrans(){
            if (this.isclient)
                return -210
            else
                return 1000
        },
        buttontrans(){
            if (this.isclient)
                return 240
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
