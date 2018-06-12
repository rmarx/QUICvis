<template>
    <div>
        <div class="tracecontainer" v-bind:style="{ height: height + 'px', width: compwidth + 'px'}">
            <div class="tracename border h-100 float-left">
                {{ trace._trace.name}}
            </div>
            <div class="h-100 float-left">
                <ConnInfo v-for="n in amountconns" v-bind:traceid="traceid" v-bind:connid="n" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import ConnInfo from './ConnInfo'
export default {
    name: "traceinfo",
    props: ['traceid'],
    data() {
        return {
            compheight: 120,
            compwidth: 25
        }
    },
    computed: {
        trace() {
            return this.$store.getters.getFileByIndex(this.traceid);   
        },
        height() {
            return this.$store.getters.getAmountConnsInFile(this.traceid) * this.compheight;
        },
        amountconns() {
            return this.$store.getters.getAmountConnsInFile(this.traceid)
        }
    },
    components: {
        ConnInfo
    }
}
</script>
<style>
.tracename{
    writing-mode: vertical-rl;
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    text-align: center;
}
.tracecontainer{
    display: flex;
}
</style>