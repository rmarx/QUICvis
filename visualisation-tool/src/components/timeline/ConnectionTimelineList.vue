<template>
    <div>
        <ConnTimeDiagram v-for="(file, fileindex) in traces" v-bind:traceid="fileindex" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import ConnTimeDiagram from './ConnTimeDiagram'
export default {
    name: "connectiontimelinelist",
    computed: {
        traces() {
            return this.$store.state.vissettings.getAllFiles();   
        },
    },
    components: {
        ConnTimeDiagram
    },
}
</script>
<style>
.svgcont-trace{
    width: 100%;
    display: block;
    float: left;
}
</style>