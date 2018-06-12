<template>
    <div>
        <div class="" v-bind:style="{ height: height + 'px', width: compwidth + 'px'}">
            <div class="tracename h-100">
                {{ trace._trace.name}}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
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
        }
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
</style>