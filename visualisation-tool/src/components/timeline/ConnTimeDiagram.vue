<template>
    <div>
        <svg height="120" class="svgcont-trace" v-for="(conn, connindex) in filteredconns">
        </svg>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import * as d3 from "d3";
import { svg } from "d3";
export default {
    name: "conntimediagram",
    props: ['traceid'],
    computed: {
        filteredconns() {
            return this.$store.getters.getFilteredConnsInFile(this.traceid)
        }
    },
    mounted() {
        /*let conns = this.filteredconns
        let cont = d3.select("#timelinediagram-trace-" + this.traceid)
        conns.forEach(element => {
            let svgcont = cont.append("div").append("svg").attr("height", "60").attr("class", "svgdiagramcont")
            let rect = svgcont.append("rect").attr("height", "5").attr("width", "5")
        });*/
    }
}
</script>
<style>
.svgcont-trace{
    display: block;
    width: 100%;
    float: left;
}
</style>