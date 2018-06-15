<template>
    <div>
        <div class="" v-bind:style="{ height: compheight + 'px', width: compwidth + 'px'}">
            <div class="conn_name h-100 float-left border">
                {{ 'conn' + (connid + 1)}}
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
            compwidth: 25
        }
    },
    computed: {
        conn() {
            return this.$store.getters.getConnByIndex(this.traceid, this.connid);   
        },
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
</style>